import { createCharacter } from "@/lib/actions/character.actions";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import mongoose from "mongoose";

// Mock the revalidatePath function since we're in a test environment
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Character Creation Performance Benchmark", () => {
  let testUser: any;
  let testCampaign: any;

  const originalLog = console.log;

  beforeAll(async () => {
    // Mock console.log to avoid I/O overhead
    console.log = jest.fn();

    // Connect DB is handled by setup.ts, but we need to ensure models are registered
    // User model is imported so it should be registered.

    // Create a test user
    // We use a unique email to avoid conflicts with other tests if running in parallel (though usually jest runs in isolation per file if configured so)
    const email = "perf-test-" + Date.now() + "@test.com";
    testUser = await User.create({
      email,
      username: "perfuser",
      name: "Perf User",
      password: "perfpassword",
    });

    // Create a test campaign
    testCampaign = await Campaign.create({
      name: "Perf Campaign",
      owner: testUser._id,
      description: "Performance Test Description",
      isAccepptingCharacters: true,
    });
  });

  afterAll(() => {
    console.log = originalLog;
  });

  // Increase timeout for benchmark
  jest.setTimeout(60000);

  test("Benchmark createCharacter performance", async () => {
    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const result = await createCharacter({
        name: `Perf Char ${i}`,
        owner: testUser.email,
        campaign: testCampaign._id.toString(),
        status: "alive",
      });

      if (!result.ok) {
        throw new Error(`Failed to create character at iteration ${i}: ${result.message}`);
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    originalLog(`
      ========================================
      BENCHMARK RESULTS (createCharacter)
      Iterations: ${iterations}
      Total Time: ${totalTime.toFixed(2)} ms
      Average Time per Operation: ${avgTime.toFixed(2)} ms
      ========================================
    `);

    // Simple assertion to ensure test passes
    expect(true).toBe(true);
  });
});
