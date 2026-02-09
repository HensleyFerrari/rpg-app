import { changePassword } from "@/lib/actions/user.actions";
import { auth } from "@/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

jest.mock("@/auth");
jest.mock("@/models/User");
jest.mock("@/lib/mongodb"); // Assuming ../mongodb resolves to @/lib/mongodb or I might need to mock relative path?
// Actually, jest usually mocks by module name. Since the source imports "../mongodb", if I mock "@/lib/mongodb" and they are the same file, it depends on jest config.
// Better to mock the relative import or ensure module mapping works.
// Given tsconfig paths usually map @/ to ./, let's assume standard Next.js setup.
// However, the import in user.actions.ts is `import { connectDB } from "../mongodb";`.
// If I use `jest.mock("@/lib/mongodb")`, it might not match "../mongodb".
// I'll try to rely on module mapping. If it fails, I'll adjust.

jest.mock("bcryptjs");

describe("changePassword", () => {
  const mockUser = {
    _id: "user123",
    email: "test@example.com",
    password: "hashedPassword",
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    const result = await changePassword("old", "new");
    expect(result).toEqual({ ok: false, message: "Não autenticado" });
  });

  it("should return error if user not found", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    // Mocking chained method .select("+password")
    const mockFindOne = {
      select: jest.fn().mockResolvedValue(null),
    };
    (User.findOne as jest.Mock).mockReturnValue(mockFindOne);

    const result = await changePassword("old", "new");
    expect(result).toEqual({ ok: false, message: "Usuário não encontrado" });
  });

  it("should return error if current password is incorrect", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const mockFindOne = {
      select: jest.fn().mockResolvedValue(mockUser),
    };
    (User.findOne as jest.Mock).mockReturnValue(mockFindOne);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await changePassword("wrong", "new");
    expect(result).toEqual({ ok: false, message: "Senha atual incorreta" });
  });

  it("should succeed if everything is correct", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const mockFindOne = {
      select: jest.fn().mockResolvedValue(mockUser),
    };
    (User.findOne as jest.Mock).mockReturnValue(mockFindOne);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

    const result = await changePassword("correct", "new");

    expect(bcrypt.compare).toHaveBeenCalledWith("correct", "hashedPassword");
    expect(bcrypt.hash).toHaveBeenCalledWith("new", 10);
    expect(mockUser.password).toBe("newHashedPassword");
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, message: "Senha atualizada com sucesso" });
  });
});
