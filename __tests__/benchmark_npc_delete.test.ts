
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { deleteNPC } from '@/lib/actions/NPC.actions';
import NPC from '@/models/NPC';
import User from '@/models/User';
import Campaign from '@/models/Campaign';

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('NPC Delete Performance Benchmark', () => {
  let userId: string;
  let campaignId: string;

  beforeEach(async () => {
    // Clean up is done by setup.ts afterEach, but we need to populate data
    // Create a user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    userId = user._id.toString();

    // Create a campaign
    const campaign = await Campaign.create({
      name: 'Test Campaign',
      owner: userId,
      description: 'A test campaign',
    });
    campaignId = campaign._id.toString();
  });

  it('measures execution time for deleteNPC', async () => {
    const iterations = 1000;
    let totalTime = 0;

    for (let i = 0; i < iterations; i++) {
      // Create an NPC to delete
      const npc = await NPC.create({
        name: `Test NPC ${i}`,
        owner: userId,
        campaign: campaignId,
        description: 'A test NPC',
      });
      const npcId = npc._id.toString();

      const start = process.hrtime();

      // Execute deleteNPC
      const result = await deleteNPC(npcId);

      const end = process.hrtime(start);
      const durationInMs = (end[0] * 1000 + end[1] / 1e6);
      totalTime += durationInMs;

      expect(result.ok).toBe(true);

      // Verify deletion (only for the last one to save time?) No, let's trust result.ok for now
      // Or check periodically?
      // Checking DB every time adds overhead to the test but not to the measurement loop.
    }

    const averageTime = totalTime / iterations;
    console.log(`Average deleteNPC execution time over ${iterations} iterations: ${averageTime.toFixed(3)}ms`);
  });
});
