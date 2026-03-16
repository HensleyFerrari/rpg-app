const mongoose = require('mongoose');

async function runBenchmark() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const campaignSchema = new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId, name: String });
  const characterSchema = new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId, campaign: mongoose.Schema.Types.ObjectId, name: String, status: String });

  const Campaign = mongoose.model('Campaign', campaignSchema);
  const Character = mongoose.model('Character', characterSchema);

  const userId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();

  // Seed data
  console.log('Seeding data...');
  const campaignDocs = [];
  for(let i=0; i<100; i++) {
      campaignDocs.push({ owner: userId, name: `Campaign ${i}` });
  }
  const campaigns = await Campaign.insertMany(campaignDocs);

  const characterDocs = [];
  for(let i=0; i<10000; i++) {
      characterDocs.push({
        name: `Char ${i}`,
        owner: i % 2 === 0 ? userId : otherUserId,
        campaign: campaigns[i % 100]._id,
        status: 'alive'
      });
  }
  await Character.insertMany(characterDocs);

  const MEASURE_ITERATIONS = 50;

  console.log('Running unoptimized version...');
  const unoptimizedTimes = [];
  for (let i = 0; i < MEASURE_ITERATIONS; i++) {
    const start1 = process.hrtime.bigint();
    const ownedCampaigns = await Campaign.find({ owner: userId }).select("_id");
    const campaignIds = ownedCampaigns.map((c) => c._id);
    await Character.find({
      $or: [{ owner: userId }, { campaign: { $in: campaignIds } }],
    });
    const end1 = process.hrtime.bigint();
    unoptimizedTimes.push(Number(end1 - start1) / 1_000_000);
  }

  console.log('Running optimized version...');
  const optimizedTimes = [];
  for (let i = 0; i < MEASURE_ITERATIONS; i++) {
    const start2 = process.hrtime.bigint();
    const distinctCampaignIds = await Campaign.distinct("_id", { owner: userId });
    await Character.find({
      $or: [{ owner: userId }, { campaign: { $in: distinctCampaignIds } }],
    });
    const end2 = process.hrtime.bigint();
    optimizedTimes.push(Number(end2 - start2) / 1_000_000);
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  console.log(`Unoptimized Average: ${avg(unoptimizedTimes).toFixed(3)} ms`);
  console.log(`Optimized Average: ${avg(optimizedTimes).toFixed(3)} ms`);

  await mongoose.disconnect();
  await mongoServer.stop();
}

runBenchmark().catch(console.error);
