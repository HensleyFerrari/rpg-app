import { addCharacterToBattle } from "@/lib/actions/battle.actions";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Battle from "@/models/Battle";
import Character from "@/models/Character";
import mongoose from "mongoose";

// Mock the revalidatePath function
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock pusher
jest.mock("@/lib/pusher", () => ({
  triggerBattleUpdate: jest.fn(),
}));

// Mock getCurrentUser
jest.mock("@/lib/actions/user.actions", () => ({
  getCurrentUser: jest.fn(() => ({
    _id: new mongoose.Types.ObjectId(),
    email: "test@test.com",
  })),
}));

describe("Benchmark: Add Characters to Battle", () => {
  let testUser: any;
  let testCampaign: any;
  let testCharacters: any[] = [];
  let testBattle: any;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: "bench@test.com",
      username: "benchuser",
      name: "Bench User",
      password: "testpassword",
    });

    // Create a test campaign
    testCampaign = await Campaign.create({
      name: "Bench Campaign",
      owner: testUser._id,
      description: "Bench Description",
    });

    // Create a test battle
    testBattle = await Battle.create({
      name: "Bench Battle",
      campaign: testCampaign._id,
      owner: testUser._id,
      active: true,
      currentRound: 1,
      characters: [],
    });

    // Create 10 test characters
    testCharacters = [];
    for (let i = 0; i < 10; i++) {
      const char = await Character.create({
        name: `Bench Character ${i}`,
        owner: testUser._id,
        campaign: testCampaign._id,
        status: "alive",
      });
      testCharacters.push(char);
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Battle.deleteMany({});
    await Character.deleteMany({});
  });

  it("should benchmark sequential add", async () => {
    const start = performance.now();

    for (const character of testCharacters) {
      await addCharacterToBattle(
        testBattle._id.toString(),
        character._id.toString()
      );
    }

    const end = performance.now();
    console.log(`Sequential Add Time: ${(end - start).toFixed(2)} ms`);

    const updatedBattle = await Battle.findById(testBattle._id);
    expect(updatedBattle?.characters).toHaveLength(10);
  });
});
