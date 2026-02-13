import {
  updateSystemFields,
} from "@/lib/actions/system.actions";
import RPGSystem from "@/models/RPGSystem";
import mongoose from "mongoose";

// Mock the revalidatePath function
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockUserId = new mongoose.Types.ObjectId();

// Mock getCurrentUser
jest.mock("@/lib/actions/user.actions", () => ({
  getCurrentUser: jest.fn(),
}));

// We need to import the mocked function to set its implementation
import { getCurrentUser } from "@/lib/actions/user.actions";

describe("System Actions", () => {
  let testSystem: any;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock user return
    (getCurrentUser as jest.Mock).mockResolvedValue({
      _id: mockUserId,
      email: "test@test.com",
    });

    // Create a test system
    testSystem = await RPGSystem.create({
      name: "Test System",
      owner: mockUserId,
      description: "Initial Description",
    });
  });

  describe("updateSystemFields", () => {
    it("should update system fields successfully when owner matches", async () => {
      const result = await updateSystemFields(testSystem._id.toString(), {
        description: "Updated Description",
        hasInventory: false
      });

      expect(result.success).toBe(true);
      expect(result.data.description).toBe("Updated Description");
      expect(result.data.hasInventory).toBe(false);

      // Verify in DB
      const updated = await RPGSystem.findById(testSystem._id);
      expect(updated.description).toBe("Updated Description");
    });

    it("should return error if system does not exist", async () => {
      const result = await updateSystemFields(new mongoose.Types.ObjectId().toString(), {
        description: "Updated",
      });

      expect(result.error).toBe("System not found or unauthorized");
    });

    it("should return error if user is not owner", async () => {
      // Change mock to return a different user
      (getCurrentUser as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        email: "other@test.com",
      });

      const result = await updateSystemFields(testSystem._id.toString(), {
        description: "Hacked Description",
      });

      expect(result.error).toBe("System not found or unauthorized");

      // Verify not updated
      const notUpdated = await RPGSystem.findById(testSystem._id);
      expect(notUpdated.description).toBe("Initial Description");
    });
  });
});
