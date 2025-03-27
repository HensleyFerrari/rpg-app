"use server";

import { connectDB } from "../mongodb";
import Campaign from "@/models/Campaign";
import { findByEmail } from "./user.actions";

export const getCampaigns = async () => {
  await connectDB();

  const campaigns = await Campaign.find();

  if (campaigns.length === 0) {
    return { message: "Não existem campanhas cadastradas" };
  }
  return campaigns;
};

type createCamp = {
  name: string;
  email: string;
};

export const createCampaign = async ({ name, email }: createCamp) => {
  await connectDB();
  const user = await findByEmail(email);
  const data = { name, owner: user._id };
  const campaign = await Campaign.create(data);

  if (!campaign) {
    return { ok: false, message: "Não foi possivel criar sua campanha" };
  }

  return { ok: true, message: "Camapanha criada com suscesso!" };
};

export const getMyCampaigns = async ({ email }: any) => {
  await connectDB();
  const user = await findByEmail(email);
  const campaings = await Campaign.find({ owner: user._id });
  return campaings;
};

export const countCampaigns = async () => {
  await connectDB();

  const count = Campaign.countDocuments();

  return count;
};
