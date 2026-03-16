
import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import User from "@/models/User";
import { jest } from "@jest/globals";
import mongoose from "mongoose";

// Mock React cache
jest.mock("react", () => {
  const originalModule = jest.requireActual("react") as any;
  return {
    ...originalModule,
    cache: (fn: any) => fn,
  };
});

// Mock Auth
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// Import auth after mocking
import { auth } from "@/auth";

describe("getMyCampaigns Benchmark", () => {
  const testUser = {
    email: "test@example.com",
    name: "Test User",
    username: "testuser",
    password: "password123",
    avatarUrl: "http://example.com/avatar.png"
  };

  beforeAll(async () => {
    // We assume connection is handled by setup.ts
  });

  afterAll(async () => {
    // Nothing to do, setup.ts handles it
  });

  beforeEach(async () => {
    // Create user before each test because setup.ts clears DB after each test
    await User.create(testUser);

    (auth as jest.Mock).mockResolvedValue({
      user: { email: testUser.email },
    });
  });

  it("should return campaigns successfully", async () => {
      const result = await getMyCampaigns();
      expect(result.ok).toBe(true);
  });

  it("benchmarks getMyCampaigns execution time", async () => {
    const iterations = 50;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const result = await getMyCampaigns();
      if (!result.ok) {
          throw new Error("getMyCampaigns failed during benchmark: " + result.message);
      }
    }

    const end = performance.now();
    const duration = end - start;
    const avg = duration / iterations;

    console.log(`BENCHMARK_RESULT: Total duration for ${iterations} runs: ${duration.toFixed(2)}ms`);
    console.log(`BENCHMARK_RESULT: Average duration per run: ${avg.toFixed(2)}ms`);

    expect(duration).toBeGreaterThan(0);
  });
});
