import { getCurrentUser } from "@/lib/actions/user.actions";
import User from "@/models/User";
import { auth } from "@/auth";

// Mock auth
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// Mock react cache to just call the function, as cache doesn't work in Jest environment by default
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (fn: any) => fn,
}));

describe("User Actions", () => {
  describe("getCurrentUser", () => {
    it("should return null if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return null if session has no user", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: null });
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return null if session user has no email", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { email: null } });
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return user if session is valid and user exists", async () => {
      // Create user in DB
      await User.create({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com" },
      });

      const result = await getCurrentUser();
      expect(result).not.toBeNull();
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test User");
      // Check that password is excluded
      expect(result.password).toBeUndefined();
    });
  });
});
