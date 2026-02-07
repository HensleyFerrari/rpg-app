
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Battle from "../models/Battle";
import Character from "../models/Character";
import User from "../models/User";
import Campaign from "../models/Campaign";

const NUM_BATTLES = 2000;
const ACTIVE_BATTLES = 20;

async function runBenchmark() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  console.log("Connected to in-memory MongoDB");

  // Setup Data
  const user = await User.create({
    email: "test@example.com",
    name: "Test User",
    password: "password",
  });

  const campaign = await Campaign.create({
    name: "Test Campaign",
    owner: user._id,
    description: "Test Description",
    players: [],
    isAccepptingCharacters: true,
  });

  const character = await Character.create({
    name: "Test Character",
    owner: user._id,
    campaign: campaign._id,
    status: "alive",
  });

  console.log(`Creating ${NUM_BATTLES} battles (${ACTIVE_BATTLES} active)...`);

  const battles = [];
  for (let i = 0; i < NUM_BATTLES; i++) {
    battles.push({
      name: `Battle ${i}`,
      owner: user._id,
      campaign: campaign._id,
      characters: [character._id],
      active: i < ACTIVE_BATTLES, // First ACTIVE_BATTLES are active
      round: 1,
    });
  }

  await Battle.insertMany(battles);
  console.log("Battles created.");

  // Warmup
  await Battle.findOne({ characters: character._id });

  // Measure Old Approach
  const startOld = process.hrtime.bigint();

  const allBattles = await Battle.find({ characters: character._id });
  const activeBattlesOld = allBattles.filter((b: any) => b.active);

  const endOld = process.hrtime.bigint();
  const durationOld = Number(endOld - startOld) / 1e6; // ms

  console.log(`Old Approach (Fetch All + JS Filter): ${durationOld.toFixed(4)} ms`);
  console.log(`Found ${activeBattlesOld.length} active battles.`);

  // Measure New Approach
  const startNew = process.hrtime.bigint();

  const activeBattlesNew = await Battle.find({ characters: character._id, active: true });

  const endNew = process.hrtime.bigint();
  const durationNew = Number(endNew - startNew) / 1e6; // ms

  console.log(`New Approach (DB Query): ${durationNew.toFixed(4)} ms`);
  console.log(`Found ${activeBattlesNew.length} active battles.`);

  const improvement = durationOld / durationNew;
  console.log(`Speedup: ${improvement.toFixed(2)}x`);

  await mongoose.disconnect();
  await mongoServer.stop();
}

runBenchmark().catch(console.error);
