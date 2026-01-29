import {
  createCharacter,
  getCharacterById,
  getCharactersByCampaign,
  updateCharacter,
  deleteCharacter,
} from "@/lib/actions/character.actions";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Character from "@/models/Character";
import mongoose from "mongoose";

// Mock the revalidatePath function since we're in a test environment
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import * as userActions from "@/lib/actions/user.actions";

// Mock getCurrentUser
jest.mock("@/lib/actions/user.actions", () => ({
  getCurrentUser: jest.fn(),
}));

describe("Character Actions", () => {
  let testUser: any;
  let testCampaign: any;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: "test@test.com",
      username: "testuser",
      name: "Test User",
      password: "testpassword", // Added password field
    });

    // Setup mock to return the created test user
    (userActions.getCurrentUser as jest.Mock).mockResolvedValue({
      _id: testUser._id,
      email: testUser.email,
    });

    // Create a test campaign
    testCampaign = await Campaign.create({
      name: "Test Campaign",
      owner: testUser._id,
      description: "Test Description",
    });
  });

  describe("createCharacter", () => {
    it("should create a new character successfully", async () => {
      const result = await createCharacter({
        name: "Test Character",
        owner: testUser.email,
        campaign: testCampaign._id.toString(),
        status: "alive",
      });

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Character");
    });

    it("should fail when required fields are missing", async () => {
      const result = await createCharacter({
        name: "",
        owner: "",
        campaign: "",
        status: "alive",
      });

      expect(result.ok).toBe(false);
      expect(result.message).toBe(
        "Nome, proprietário e campanha são obrigatórios"
      );
    });
  });

  describe("getCharacterById", () => {
    it("should retrieve a character by id", async () => {
      // First create a character
      const character = await Character.create({
        name: "Test Character",
        owner: testUser._id,
        campaign: testCampaign._id,
        status: "alive",
      });

      const result = await getCharacterById(character._id.toString());

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Character");
    });

    it("should return error for invalid id", async () => {
      const result = await getCharacterById("invalid-id");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("ID de personagem inválido");
    });
  });

  describe("getCharactersByCampaign", () => {
    it("should retrieve all characters in a campaign", async () => {
      // Create test characters
      await Character.create([
        {
          name: "Character 1",
          owner: testUser._id,
          campaign: testCampaign._id,
          status: "alive",
        },
        {
          name: "Character 2",
          owner: testUser._id,
          campaign: testCampaign._id,
          status: "alive",
        },
      ]);

      const result = await getCharactersByCampaign(testCampaign._id.toString());

      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateCharacter", () => {
    it("should update a character successfully", async () => {
      const character = await Character.create({
        name: "Original Name",
        owner: testUser._id,
        campaign: testCampaign._id,
        status: "alive",
      });

      const result = await updateCharacter(character._id.toString(), {
        name: "Updated Name",
        status: "dead",
      });

      expect(result.ok).toBe(true);
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.status).toBe("dead");
    });
  });

  describe("deleteCharacter", () => {
    it("should delete a character successfully", async () => {
      const character = await Character.create({
        name: "To Be Deleted",
        owner: testUser._id,
        campaign: testCampaign._id,
        status: "alive",
      });

      const result = await deleteCharacter(character._id.toString());

      expect(result.ok).toBe(true);

      // Verify character was deleted
      const deletedCharacter = await Character.findById(character._id);
      expect(deletedCharacter).toBeNull();
    });
  });
});
