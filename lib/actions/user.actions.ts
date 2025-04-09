"use server";

import { connectDB } from "../mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export const findByEmail = async (email: string) => {
  await connectDB();

  const user = User.findOne({ email });

  return user;
};

export const updateUserCampaign = async ({ campaign, _id }: any) => {
  await connectDB();
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $push: { campaigns: campaign } },
    { new: true }
  );
  return updatedUser;
};

export const getCurrentUser = async () => {
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
};
