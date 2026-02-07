
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Battle from '../models/Battle';
import Character from '../models/Character';
import Campaign from '../models/Campaign';
import User from '../models/User';

// Helper to measure execution time
async function measureTime(label: string, fn: () => Promise<void>) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function runBenchmark() {
  console.log('Starting benchmark...');

  // 1. Setup DB
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // 2. Seed Data
  console.log('Seeding data...');
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  const userId = user._id;

  // Create Campaigns
  const campaigns = [];
  for (let i = 0; i < 20; i++) {
    campaigns.push({
      name: `Campaign ${i}`,
      owner: userId,
      description: 'Desc',
    });
  }
  const createdCampaigns = await Campaign.insertMany(campaigns);
  const campaignId = createdCampaigns[0]._id;

  // Create Battles (50 active, 50 inactive)
  const battles = [];
  for (let i = 0; i < 1000; i++) {
    battles.push({
      name: `Battle ${i}`,
      owner: userId,
      campaign: campaignId,
      active: i < 500, // First 500 active
      createdAt: new Date(Date.now() - i * 1000), // Stagger creation time
    });
  }
  await Battle.insertMany(battles);

  // Create Characters (50 alive, 50 dead)
  const characters = [];
  for (let i = 0; i < 1000; i++) {
    characters.push({
      name: `Character ${i}`,
      owner: userId,
      campaign: campaignId,
      status: i < 500 ? 'alive' : 'dead',
      createdAt: new Date(Date.now() - i * 1000),
    });
  }
  await Character.insertMany(characters);

  console.log('Data seeded. Starting measurements...');

  // 3. Measure Legacy (Fetch All)
  // Logic from app/dashboard/page.tsx
  const legacyTime = await measureTime('Legacy Approach (Fetch All)', async () => {
    // Simulate Promise.all fetching all data
    const [allBattles, allCharacters, allCampaigns] = await Promise.all([
      Battle.find({ owner: userId }).lean(),
      Character.find({ owner: userId }).lean(),
      Campaign.find({ owner: userId }).lean(),
    ]);

    // Simulate in-memory processing
    const totalBattles = allBattles.length;
    const activeBattles = allBattles.filter((b: any) => b.active).length;

    const totalCharacters = allCharacters.length;
    const aliveCharacters = allCharacters.filter((c: any) => c.status === 'alive').length;
    const deadCharacters = allCharacters.filter((c: any) => c.status === 'dead').length;

    const totalCampaigns = allCampaigns.length;

    // Recent Activity (sort and slice)
    const recentBattles = [...allBattles]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    const recentCharacters = [...allCharacters]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  });


  // 4. Measure Optimized (Count + Limit)
  const optimizedTime = await measureTime('Optimized Approach (Count + Limit)', async () => {
    // Battle Stats
    const battleStatsPromise = Promise.all([
      Battle.countDocuments({ owner: userId }),
      Battle.countDocuments({ owner: userId, active: true }),
      Battle.find({ owner: userId }).sort({ createdAt: -1 }).limit(3).lean()
    ]);

    // Character Stats
    const characterStatsPromise = Promise.all([
      Character.countDocuments({ owner: userId }),
      Character.countDocuments({ owner: userId, status: 'alive' }),
      Character.countDocuments({ owner: userId, status: 'dead' }),
      Character.find({ owner: userId }).sort({ createdAt: -1 }).limit(3).lean()
    ]);

    // Campaign Stats
    const campaignStatsPromise = Promise.all([
        Campaign.countDocuments({ owner: userId })
    ]);

    const [
      [totalBattles, activeBattles, recentBattles],
      [totalCharacters, aliveCharacters, deadCharacters, recentCharacters],
      [totalCampaigns]
    ] = await Promise.all([
      battleStatsPromise,
      characterStatsPromise,
      campaignStatsPromise
    ]);
  });

  console.log(`Improvement: ${(legacyTime - optimizedTime).toFixed(2)}ms (${((legacyTime - optimizedTime) / legacyTime * 100).toFixed(1)}%)`);

  // Cleanup
  await mongoose.disconnect();
  await mongod.stop();
}

runBenchmark().catch(console.error);
