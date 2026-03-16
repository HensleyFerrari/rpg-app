// benchmark_campaigns.js

const MOCK_DELAY = 100;

const mockGetCampaigns = async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
};

const mockGetCurrentUser = async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { id: 'user1' };
};

async function runSequential() {
  const start = Date.now();

  const searchParams = Promise.resolve({ q: undefined, filter: undefined });
  const { q: query, filter: filterType } = await searchParams;

  const campaignsResponse = await mockGetCampaigns({ query, filterType });
  const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : [];

  const currentUser = await mockGetCurrentUser();

  const end = Date.now();
  const duration = end - start;
  console.log(`Sequential execution took: ${duration}ms`);
  return duration;
}

async function runParallel() {
  const start = Date.now();

  const searchParams = Promise.resolve({ q: undefined, filter: undefined });
  const { q: query, filter: filterType } = await searchParams;

  const [campaignsResponse, currentUser] = await Promise.all([
    mockGetCampaigns({ query, filterType }),
    mockGetCurrentUser()
  ]);
  const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : [];

  const end = Date.now();
  const duration = end - start;
  console.log(`Parallel execution took: ${duration}ms`);
  return duration;
}

async function runBenchmark() {
  console.log("Running baseline (sequential)...");
  await runSequential();
  console.log("Running optimized (parallel)...");
  await runParallel();
}

runBenchmark().catch(console.error);
