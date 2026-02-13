import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RPGSystem from '../models/RPGSystem';
import User from '../models/User';

// Helper to measure execution time
async function measureTime(label: string, fn: () => Promise<void>) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
  return duration;
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

  const system = await RPGSystem.create({
    name: 'Test System',
    owner: userId,
    description: 'Initial Description',
  });
  const systemId = system._id;

  console.log('Data seeded. Starting measurements...');

  const ITERATIONS = 100;

  // 3. Measure Legacy (2 DB calls)
  const legacyTime = await measureTime(`Legacy Approach (${ITERATIONS} iterations)`, async () => {
    for (let i = 0; i < ITERATIONS; i++) {
       // Verify ownership
       const foundSystem = await RPGSystem.findOne({ _id: systemId, owner: userId });
       if (!foundSystem) throw new Error("System not found or unauthorized");

       await RPGSystem.findByIdAndUpdate(
         systemId,
         { $set: { description: `Updated Legacy ${i}` } },
         { new: true }
       );
    }
  });


  // 4. Measure Optimized (1 DB call)
  const optimizedTime = await measureTime(`Optimized Approach (${ITERATIONS} iterations)`, async () => {
    for (let i = 0; i < ITERATIONS; i++) {
        const updatedSystem = await RPGSystem.findOneAndUpdate(
           { _id: systemId, owner: userId },
           { $set: { description: `Updated Optimized ${i}` } },
           { new: true }
         );
        if (!updatedSystem) throw new Error("System not found or unauthorized");
    }
  });

  const improvement = legacyTime - optimizedTime;
  const percent = (improvement / legacyTime) * 100;

  console.log(`\nResults:`);
  console.log(`Legacy Total: ${legacyTime.toFixed(2)}ms`);
  console.log(`Optimized Total: ${optimizedTime.toFixed(2)}ms`);
  console.log(`Improvement: ${improvement.toFixed(2)}ms (${percent.toFixed(1)}%)`);
  console.log(`Avg Legacy per op: ${(legacyTime / ITERATIONS).toFixed(2)}ms`);
  console.log(`Avg Optimized per op: ${(optimizedTime / ITERATIONS).toFixed(2)}ms`);

  // Cleanup
  await mongoose.disconnect();
  await mongod.stop();
}

runBenchmark().catch(console.error);
