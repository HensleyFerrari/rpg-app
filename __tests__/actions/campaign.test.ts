import {
  createCampaign,
  getCampaignById,
  getMyCampaigns,
  updateCampaign,
  deleteCampaign,
} from "@/lib/actions/campaign.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import mongoose from "mongoose";

// Mock the revalidatePath function
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock getCurrentUser and findByEmail
jest.mock("@/lib/actions/user.actions", () => ({
  getCurrentUser: jest.fn(() => ({
    _id: new mongoose.Types.ObjectId(),
    email: "test@test.com",
  })),
  findByEmail: jest.fn((email) => User.findOne({ email })),
  updateUserCampaign: jest.fn(async ({ campaign, _id }) => {
    return User.findByIdAndUpdate(
      _id,
      { $push: { campaigns: campaign } },
      { new: true }
    );
  }),
}));

describe("Campaign Actions", () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: "test@test.com",
      username: "testuser",
      name: "Test User",
      password: "testpassword", // Added password field
    });

    // Update mock to return the created test user
    (getCurrentUser as jest.Mock).mockResolvedValue(
      JSON.parse(JSON.stringify(testUser))
    );
  });

  describe("createCampaign", () => {
    it("should create a new campaign successfully", async () => {
      const result = await createCampaign({
        name: "Test Campaign",
        email: testUser.email,
        description: "Test Description",
      });

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Campaign");
      expect(result.data.description).toBe("Test Description");
    });

    it("should fail when required fields are missing", async () => {
      const result = await createCampaign({
        name: "",
        email: "",
      });

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Nome e email são obrigatórios");
    });
  });

  describe("getCampaignById", () => {
    it("should retrieve a campaign by id", async () => {
      // First create a campaign
      const campaign = await Campaign.create({
        name: "Test Campaign",
        owner: testUser._id,
        description: "Test Description",
      });

      const result = await getCampaignById(campaign._id.toString());

      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Campaign");
    });

    it("should return error for invalid id", async () => {
      const result = await getCampaignById("invalid-id");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("ID de campanha inválido");
    });
  });

  describe("getMyCampaigns", () => {
    it("should retrieve all campaigns for the current user", async () => {
      // Create test campaigns
      await Campaign.create([
        {
          name: "Campaign 1",
          owner: testUser._id,
          description: "Test Description 1",
        },
        {
          name: "Campaign 2",
          owner: testUser._id,
          description: "Test Description 2",
        },
      ]);

      const result = await getMyCampaigns();

      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateCampaign", () => {
    it("should update a campaign successfully", async () => {
      const campaign = await Campaign.create({
        name: "Original Name",
        owner: testUser._id,
        description: "Original Description",
      });

      const result = await updateCampaign(campaign._id.toString(), {
        name: "Updated Name",
        description: "Updated Description",
      });

      expect(result.ok).toBe(true);
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.description).toBe("Updated Description");
    });
  });

  describe("deleteCampaign", () => {
    it("should delete a campaign successfully", async () => {
      const campaign = await Campaign.create({
        name: "To Be Deleted",
        owner: testUser._id,
        description: "Test Description",
      });

      const result = await deleteCampaign(campaign._id.toString());

      expect(result.ok).toBe(true);

      // Verify campaign was deleted
      const deletedCampaign = await Campaign.findById(campaign._id);
      expect(deletedCampaign).toBeNull();
    });
  });
});
