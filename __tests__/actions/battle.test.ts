import {
  createBattle,
  getBattleById,
  getBattlesByCampaign,
  updateBattle,
  deleteBattle,
  addCharacterToBattle,
} from "@/lib/actions/battle.actions";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Battle from "@/models/Battle";
import Character from "@/models/Character";
import mongoose from "mongoose";

// Mock the revalidatePath function
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock getCurrentUser
jest.mock("@/lib/actions/user.actions", () => ({
  getCurrentUser: jest.fn(() => ({
    _id: new mongoose.Types.ObjectId(),
    email: "test@test.com",
  })),
}));

describe("Battle Actions", () => {
  let testUser: any;
  let testCampaign: any;
  let testCharacter: any;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: "test@test.com",
      username: "testuser",
      name: "Test User",
      password: "testpassword",
    });

    // Create a test campaign
    testCampaign = await Campaign.create({
      name: "Test Campaign",
      owner: testUser._id,
      description: "Test Description",
    });

    // Create a test character
    testCharacter = await Character.create({
      name: "Test Character",
      owner: testUser._id,
      campaign: testCampaign._id,
      status: "alive",
    });
  });

  describe("createBattle", () => {
    it("should create a new battle successfully", async () => {
      const battleParams = {
        name: "Test Battle",
        description: "Test Battle Description",
        campaign: testCampaign._id,
        active: true,
        characters: [testCharacter._id],
      };

      const result = await createBattle(battleParams);

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Battle");
      expect(result.data.round).toBe(1);
    });
  });

  describe("getBattleById", () => {
    it("should retrieve a battle by id", async () => {
      // First create a battle
      const battle = await Battle.create({
        name: "Test Battle",
        campaign: testCampaign._id,
        owner: testUser._id,
        description: "Test Description",
        active: true,
        currentRound: 1,
      });

      const result = await getBattleById(battle._id.toString());

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Battle");
    });

    it("should return error for invalid id", async () => {
      const result = await getBattleById("invalid-id");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("ID de batalha inválido");
    });
  });

  describe("getBattlesByCampaign", () => {
    it("should retrieve all battles in a campaign", async () => {
      // Create test battles
      await Battle.create([
        {
          name: "Battle 1",
          campaign: testCampaign._id,
          owner: testUser._id,
          active: true,
          currentRound: 1,
        },
        {
          name: "Battle 2",
          campaign: testCampaign._id,
          owner: testUser._id,
          active: true,
          currentRound: 1,
        },
      ]);

      const result = await getBattlesByCampaign(testCampaign._id.toString());

      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateBattle", () => {
    it("should update a battle successfully", async () => {
      const battle = await Battle.create({
        name: "Original Battle",
        campaign: testCampaign._id,
        owner: testUser._id,
        active: true,
        currentRound: 1,
      });

      const result = await updateBattle(battle._id.toString(), {
        name: "Updated Battle",
        round: 2,
      });

      expect(result.ok).toBe(true);
      expect(result.data.name).toBe("Updated Battle");
      expect(result.data.round).toBe(2);
    });
  });

  describe("deleteBattle", () => {
    it("should delete a battle successfully", async () => {
      const battle = await Battle.create({
        name: "To Be Deleted",
        campaign: testCampaign._id,
        owner: testUser._id,
        active: true,
        currentRound: 1,
      });

      const result = await deleteBattle(battle._id.toString());

      expect(result.ok).toBe(true);

      // Verify battle was deleted
      const deletedBattle = await Battle.findById(battle._id);
      expect(deletedBattle).toBeNull();
    });
  });

  describe("addCharacterToBattle", () => {
    it("should add a character to battle successfully", async () => {
      const battle = await Battle.create({
        name: "Test Battle",
        campaign: testCampaign._id,
        owner: testUser._id,
        active: true,
        currentRound: 1,
        characters: [],
      });

      const result = await addCharacterToBattle(
        battle._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.ok).toBe(true);
      expect(result.data.characters.map((c) => c.toString())).toContain(
        testCharacter._id.toString()
      );
    });

    it("should not add the same character twice", async () => {
      const battle = await Battle.create({
        name: "Test Battle",
        campaign: testCampaign._id,
        owner: testUser._id,
        active: true,
        currentRound: 1,
        characters: [testCharacter._id],
      });

      const result = await addCharacterToBattle(
        battle._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Personagem já está na batalha");
    });
  });
});
