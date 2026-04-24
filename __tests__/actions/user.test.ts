import { changePassword } from "@/modules/platform/user/user.actions";
import { auth } from "@/auth";
import User from "@/modules/platform/user/user.model";
import bcrypt from "bcryptjs";

jest.mock("@/auth");
jest.mock("@/modules/platform/user/user.model");
jest.mock("@/shared/db/mongodb");
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
    expect(result).toEqual({
      ok: true,
      message: "Senha atualizada com sucesso",
    });
  });
});
