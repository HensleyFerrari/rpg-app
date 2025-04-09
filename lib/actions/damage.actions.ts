"use server";

import Damage, { DamageDocument } from "@/models/Damage";
import { connectDB } from "../mongodb";
import Character from "@/models/Character";
import Battle from "@/models/Battle";

const serializeData = (data: DamageDocument) => {
  return JSON.parse(JSON.stringify(data));
};

export const createDamage = async (damage: DamageDocument) => {
  await connectDB();
  // const { character } = damage;
  // const { owner, campaign } = character;
  // const damageData = {
  //   ...damage,
  //   owner,
  //   campaign
  // };
  const newDamage = new Damage(damage);
  const savedDamage = await newDamage.save();
  // await Character.findByIdAndUpdate(character, { $push: { damages: savedDamage._id } });

  const battleDamge = await Battle.findByIdAndUpdate(damage.battle, {
    $push: { rounds: savedDamage._id },
  });

  if (!battleDamge) {
    throw new Error("Battle not found");
  }

  return serializeData(savedDamage);
};

export const getAllDamagesByCampaignId = async (campaignId: string) => {
  await connectDB();
  const damages = await Damage.find({ campaign: campaignId })
    .populate("character")
    .populate("battle")
    .sort({ createdAt: -1 });
  return damages.map(serializeData);
};

export const getAllDamages = async () => {
  await connectDB();
  const damages = await Damage.find()
    .populate("character")
    .sort({ createdAt: -1 });
  return damages.map(serializeData);
};

export const getAllDamagesByBattleId = async (battleId: string) => {
  await connectDB();
  const damages = await Damage.find({ battle: battleId })
    .populate("character")
    .sort({ createdAt: -1 });
  return damages.map(serializeData);
};

export const getAllDamagesByCharacterId = async (characterId: string) => {
  await connectDB();
  const damages = await Damage.find({ character: characterId })
    .populate("character")
    .sort({ createdAt: -1 });
  return damages.map(serializeData);
};
