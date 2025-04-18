"use server";

import Damage, { DamageDocument } from "@/models/Damage";
import { connectDB } from "../mongodb";
import Battle from "@/models/Battle";
import { getBattleById } from "./battle.actions";
import { getCharacterById } from "./character.actions";
import { revalidatePath } from "next/cache";

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
      message: "Batalha já finalizada!",
    };
  }

  // Verificar se o personagem está na batalha
  const characterInBattle = battleInfo.data.characters.some(
    (char: any) => char._id.toString() === damage.character
  );

  if (!characterInBattle) {
    return {
      ok: false,
      message: "Personagem não está na batalha!",
    };
  }

  const payload = {
    ...damage,
    owner: characterInfo.data.owner._id,
    campaign: characterInfo.data.campaign._id,
  };
  const newDamage = new Damage(payload);
  const savedDamage = await newDamage.save();

  await Battle.findByIdAndUpdate(payload.battle, {
    $push: { rounds: savedDamage._id },
  });

  revalidatePath(`/dashboard/battles/${damage.battle}`);
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

export const deleteDamage = async (damageId: string, battleId: string) => {
  try {
    await connectDB();
    await Damage.findByIdAndDelete(damageId);

    // Remove damage reference from battle rounds
    await Battle.findByIdAndUpdate(battleId, {
      $pull: { rounds: damageId },
    });

    revalidatePath(`/dashboard/battles/${battleId}`);
    return {
      ok: true,
      message: "Dano removido com sucesso",
    };
  } catch (error) {
    console.error("Error deleting damage:", error);
    return {
      ok: false,
      message: "Erro ao remover dano",
    };
  }
};
