"use server";

import { connectDB } from "../mongodb";
import User from "@/models/User";

export const findByEmail = async (email: string) => {
  await connectDB();

  const user = User.findOne({ email });

  return user;
};
