import { describe, it, expect, jest } from '@jest/globals';

// Mock delays
const MOCK_DELAY = 100;

const mockGetCampaigns = jest.fn(async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
});

const mockGetCurrentUser = jest.fn(async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { id: 'user1' };
});

describe('Campaigns Page Performance Benchmark', () => {
  it('measures sequential execution time (baseline)', async () => {
    const start = Date.now();

    const searchParams = Promise.resolve({ q: undefined, filter: undefined });
    const { q: query, filter: filterType } = await searchParams;

    const campaignsResponse = await mockGetCampaigns(); // In reality args are passed
    const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : [];

    const currentUser = await mockGetCurrentUser();

    const end = Date.now();
    const duration = end - start;

    console.log(`Sequential execution took: ${duration}ms`);
    // Should be at least 2 * MOCK_DELAY
    expect(duration).toBeGreaterThanOrEqual(MOCK_DELAY * 2);
  });

  it('measures parallel execution time (optimized)', async () => {
    const start = Date.now();

    const searchParams = Promise.resolve({ q: undefined, filter: undefined });
    const { q: query, filter: filterType } = await searchParams;

    const [campaignsResponse, currentUser] = await Promise.all([
      mockGetCampaigns(),
      mockGetCurrentUser()
    ]);
    const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : [];

    const end = Date.now();
    const duration = end - start;

    console.log(`Parallel execution took: ${duration}ms`);
    // Should be around MOCK_DELAY (plus overhead), but definitely less than 2*MOCK_DELAY
    expect(duration).toBeLessThan(MOCK_DELAY * 2);
  });
});
