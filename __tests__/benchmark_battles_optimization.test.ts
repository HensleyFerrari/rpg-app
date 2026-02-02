
import { describe, it, expect, jest } from '@jest/globals';

// Mock delays
const MOCK_DELAY = 100;

const mockGetBattles = jest.fn(async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { ok: true, data: [] };
});

const mockGetCurrentUser = jest.fn(async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { id: 'user1' };
});

const mockGetCampaigns = jest.fn(async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
});

describe('Battles Page Performance Benchmark', () => {
  it('measures sequential execution time (baseline)', async () => {
    const start = Date.now();

    // Simulate sequential execution from original code
    // const { q: query, filter: filterType, campaign: campaignId } = await searchParams;
    const searchParams = Promise.resolve({ q: undefined, filter: undefined, campaign: undefined });
    const { q: query, filter: filterType, campaign: campaignId } = await searchParams;

    const currentUser = await mockGetCurrentUser();
    const battles = await mockGetBattles(); // In reality args are passed
    const campaigns = await mockGetCampaigns();

    const end = Date.now();
    const duration = end - start;

    console.log(`Sequential execution took: ${duration}ms`);
    // Should be at least 3 * MOCK_DELAY
    expect(duration).toBeGreaterThanOrEqual(MOCK_DELAY * 3);
  });

  it('measures parallel execution time (optimized)', async () => {
    const start = Date.now();

    // Simulate optimized parallel execution
    const searchParams = Promise.resolve({ q: undefined, filter: undefined, campaign: undefined });
    const { q: query, filter: filterType, campaign: campaignId } = await searchParams;

    const [currentUser, battles, campaigns] = await Promise.all([
      mockGetCurrentUser(),
      mockGetBattles(),
      mockGetCampaigns()
    ]);

    const end = Date.now();
    const duration = end - start;

    console.log(`Parallel execution took: ${duration}ms`);
    // Should be around MOCK_DELAY (plus overhead), but definitely less than 2*MOCK_DELAY
    expect(duration).toBeLessThan(MOCK_DELAY * 2);
  });
});
