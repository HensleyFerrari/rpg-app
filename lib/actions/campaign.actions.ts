"use server";

import { connectDB } from "../mongodb";
import Campaign from "@/models/Campaign";

export const getCampaigns = async () => {
  await connectDB();

  const campaigns = await Campaign.find();

  if (campaigns.length === 0) {
    return { message: "Não existem campanhas cadastradas" };
  }
  return campaigns;
};

export const createCampaign = async (data: any) => {
  console.log(data);
  await connectDB();

  const campaign = await Campaign.create(data);

  if (!campaign) {
    return { ok: false, message: "Não foi possivel criar sua campanha" };
  }

  return { ok: true, message: "Camapanha criada com suscesso!" };
};
