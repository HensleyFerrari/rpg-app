import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import Campaign from '../models/Campaign';
import Character from '../models/Character';

// Helper to disable console.log during benchmark to avoid IO bottleneck
const originalLog = console.log;

describe('Character Actions Performance Benchmark', () => {

  it('measures unoptimized vs optimized querying', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();

    // Create 100 campaigns owned by the user
    const campaignDocs = Array.from({ length: 100 }, () => ({
      name: 'Test Campaign',
      owner: userId,
    }));
    const campaigns = await Campaign.insertMany(campaignDocs);

    // Create 1000 characters, 500 for the user's campaigns and 500 for other campaigns
    const characterDocs = [];
    for (let i = 0; i < 1000; i++) {
      characterDocs.push({
        name: `Char ${i}`,
        owner: i % 2 === 0 ? userId : otherUserId,
        campaign: campaigns[i % 100]._id,
        status: 'alive',
      });
    }
    await Character.insertMany(characterDocs);

    const MEASURE_ITERATIONS = 50;

    let unoptimizedTotalTime = 0n;
    for (let i = 0; i < MEASURE_ITERATIONS; i++) {
      const start = process.hrtime.bigint();
      // Unoptimized approach
      const ownedCampaigns = await Campaign.find({
        owner: userId,
      }).select("_id");
      const campaignIds = ownedCampaigns.map((c) => c._id);

      await Character.find({
        $or: [{ owner: userId }, { campaign: { $in: campaignIds } }],
      });
      const end = process.hrtime.bigint();
      unoptimizedTotalTime += (end - start);
    }

    let optimizedTotalTime = 0n;
    for (let i = 0; i < MEASURE_ITERATIONS; i++) {
      const start = process.hrtime.bigint();
      // Optimized approach using .distinct()
      const campaignIds = await Campaign.distinct("_id", { owner: userId });

      await Character.find({
        $or: [{ owner: userId }, { campaign: { $in: campaignIds } }],
      });
      const end = process.hrtime.bigint();
      optimizedTotalTime += (end - start);
    }

    const unoptimizedAvg = Number(unoptimizedTotalTime / BigInt(MEASURE_ITERATIONS)) / 1_000_000;
    const optimizedAvg = Number(optimizedTotalTime / BigInt(MEASURE_ITERATIONS)) / 1_000_000;

    originalLog(`Unoptimized Average: ${unoptimizedAvg} ms`);
    originalLog(`Optimized Average: ${optimizedAvg} ms`);

    // Verify optimized is better
    expect(optimizedAvg).toBeLessThanOrEqual(unoptimizedAvg * 1.5);
  }, 15000); // 15s timeout
});
