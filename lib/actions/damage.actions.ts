"use server";

import Damage, { DamageDocument } from "@/models/Damage";
import { connectDB } from "../mongodb";
import Battle from "@/models/Battle";
import { getBattleById } from "./battle.actions";
import { getCharacterById } from "./character.actions";

const serializeData = (data: DamageDocument) => {
  return JSON.parse(JSON.stringify(data));
};

export const createDamage = async (damage: any) => {
  await connectDB();
  const characterInfo = await getCharacterById(damage.character);

  const battleInfo = await getBattleById(damage.battle);
  if (!battleInfo.data.active) {
    return {
      ok: false,
      message: "Batalha já finalizada! ",
    };
  }

  const payload = {
    ...damage,
    owner: characterInfo.data.owner._id,
    campaign: characterInfo.data.campaign._id,
  };
  const newDamage = new Damage(payload);
  const savedDamage = await newDamage.save();
  // await Character.findByIdAndUpdate(payload.character, {
  //   $push: { damages: savedDamage._id },
  // });

  await Battle.findByIdAndUpdate(payload.battle, {
    $push: { rounds: savedDamage._id },
  });

  return {
    ok: true,
    message: "Dano registrado com sucesso",
    data: serializeData(savedDamage),
  };
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
