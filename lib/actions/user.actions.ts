"use server";

import { connectDB } from "../mongodb";
import User from "@/models/User";

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
