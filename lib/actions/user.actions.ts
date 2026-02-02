"use server";

import { connectDB } from "../mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import { cache } from "react";
import bcrypt from "bcryptjs";

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export const findByEmail = async (email: string) => {
  await connectDB();

  const user = User.findOne({ email });

  return user;
};

export const getCurrentUser = cache(async () => {
  try {
    const session = await auth();
    // If no session or no user, return null
    if (!session || !session.user) {
      return null;
    }
    // Get the user email from the session
    const email = session.user.email;
    if (!email) {
      return null;
    }
    // Connect to the database
    await connectDB();

    // Find the user by email and return complete user data
    const currentUser = await User.findOne({ email }).select("-password");
    return serializeData(currentUser);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
});

export async function updateAvatar(userId: string, avatarUrl: string) {
  try {
    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return { ok: false, message: "User not found" };
    }

    return { ok: true, data: updatedUser.avatarUrl };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { ok: false, message: "Failed to update avatar" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return { ok: false, message: "Não autenticado" };
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select(
      "+password"
    );

    if (!user) {
      return { ok: false, message: "Usuário não encontrado" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return { ok: false, message: "Senha atual incorreta" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { ok: true, message: "Senha atualizada com sucesso" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { ok: false, message: "Erro ao atualizar senha" };
  }
}
