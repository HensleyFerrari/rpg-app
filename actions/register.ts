"use server";
import { connectDB } from "@/lib/mongodb";
import User from "@/modules/platform/user/user.model";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const register = async (values: any) => {
  try {
    const validatedData = registerSchema.parse(values);
    const { email, password, name } = validatedData;

    await connectDB();
    const userFound = await User.findOne({ email });
    if (userFound) {
      return {
        error: "Email already exists!",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    return { success: true };
  } catch (e) {
    console.error("Registration error:", e);
    return {
      error: "An error occurred while creating the account",
    };
  }
};
