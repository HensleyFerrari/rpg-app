"use server";

import { revalidatePath } from "next/cache";
import Damage from "@/models/Damage";
import Battle from "@/models/Battle";
import User from "@/models/User";
import { getBattleById } from "./battle.actions";
import { getCharacterById } from "./character.actions";
import { getCurrentUser } from "./user.actions";
import { triggerBattleUpdate } from "../pusher";
import { safeAction } from "./safe-action";

import { serializeData } from "../utils";
import { checkOwnership, verifyBattleMaster, canEditCharacter } from "../auth";

export const createDamage = async (damage: any) => {
  return safeAction(async () => {
    const user = await getCurrentUser();
    const battleInfo = await getBattleById(damage.battle);
    if (!battleInfo.data.active) {
      return {
        ok: false,
        message: "Batalha já finalizada!",
      };
    }

    let characterInfo: any = null;
    if (damage.character) {
      characterInfo = await getCharacterById(damage.character);

      const characterInBattle = battleInfo.data.characters.some(
        (char: any) => char._id.toString() === damage.character,
      );

      if (!characterInBattle) {
        return {
          ok: false,
          message: "Personagem não está na batalha!",
        };
      }
    }

    const isBattleMaster = verifyBattleMaster(battleInfo.data, user?._id);
    let canCreate = isBattleMaster;

    if (characterInfo && user) {
      if (canEditCharacter(characterInfo.data, user._id)) {
        canCreate = true;
      }
    }

    if (!canCreate) {
      return {
        ok: false,
        message: "Você não tem permissão para registrar dano.",
      };
    }

    const payload = {
      ...damage,
      owner: user
        ? user._id
        : characterInfo
          ? characterInfo.data.owner._id
          : battleInfo.data.owner._id,
      campaign: characterInfo
        ? characterInfo.data.campaign._id
        : battleInfo.data.campaign._id,
      target: damage.target || null,
    };
    const newDamage = new Damage(payload);
    const savedDamage = await newDamage.save();

    await triggerBattleUpdate(damage.battle);
    revalidatePath(`/dashboard/battles/${damage.battle}`);
    return {
      ok: true,
      message: "Ação registrada com sucesso",
      data: serializeData(savedDamage),
    };
  });
};

export const getAllDamagesByCampaignId = async (campaignId: string) => {
  return safeAction(async () => {
    const damages = await Damage.find({ campaign: campaignId })
      .populate("character")
      .populate("battle")
      .populate("target")
      .sort({ createdAt: -1 });
    return serializeData(damages);
  });
};

export const getAllDamages = async () => {
  return safeAction(async () => {
    const damages = await Damage.find()
      .populate("character")
      .sort({ createdAt: -1 });
    return serializeData(damages);
  });
};

export const getAllDamagesByBattleId = async (battleId: string) => {
  return safeAction(async () => {
    const damages = await Damage.find({ battle: battleId })
      .populate("character")
      .populate("target")
      .populate({
        path: "owner",
        select: "name _id",
        model: User,
      })
      .sort({ createdAt: -1 });

    if (!damages) {
      return {
        ok: false,
        message: "Nenhum dano encontrado",
      };
    }

    if (damages.length === 0) {
      return {
        ok: true,
        message: "Nenhum dano encontrado",
        data: [],
      };
    }

    return {
      ok: true,
      message: "Danos encontrados com sucesso",
      data: serializeData(damages),
    };
  });
};

export const getAllDamagesByCharacterId = async (characterId: string) => {
  return safeAction(async () => {
    const damages = await Damage.find({ character: characterId })
      .populate("character")
      .sort({ createdAt: -1 });
    return serializeData(damages);
  });
};

export const deleteDamage = async (damageId: string, battleId: string) => {
  return safeAction(async () => {
    if (!damageId || !battleId) {
      return { ok: false, message: "IDs obrigatórios" };
    }

    const damage = await Damage.findById(damageId);
    if (!damage) {
      return { ok: false, message: "Dano não encontrado" };
    }

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return { ok: false, message: "Batalha não encontrada" };
    }

    const user = await getCurrentUser();

    // Check permissions: Owner of damage OR Battle Owner (GM)
    if (
      !checkOwnership(damage.owner, user?._id) &&
      !verifyBattleMaster(battle, user?._id)
    ) {
      return {
        ok: false,
        message: "Você não tem permissão para remover este turno",
      };
    }

    await Damage.findByIdAndDelete(damageId);

    await triggerBattleUpdate(battleId);
    revalidatePath(`/dashboard/battles/${battleId}`);
    return {
      ok: true,
      message: "Dano removido com sucesso",
    };
  });
};

export const updateDamage = async (id: string, data: any) => {
  return safeAction(async () => {
    if (!id) {
      return { ok: false, message: "ID do dano é obrigatório" };
    }

    const damage = await Damage.findById(id);
    if (!damage) {
      return { ok: false, message: "Dano não encontrado" };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, message: "Usuário não autenticado" };
    }

    const battle = await Battle.findById(damage.battle);
    if (!battle) {
      return { ok: false, message: "Batalha não encontrada" };
    }

    // Check permissions: Owner of damage OR Battle Owner (GM)
    if (
      !checkOwnership(damage.owner, user._id) &&
      !verifyBattleMaster(battle, user._id)
    ) {
      return {
        ok: false,
        message: "Você não tem permissão para editar este turno",
      };
    }

    // Update fields
    const updatedDamage = await Damage.findByIdAndUpdate(
      id,
      {
        description: data.description,
        damage: data.damage,
        type: data.type,
        isCritical: data.isCritical,
        target: data.target || null,
        character: data.character,
      },
      { new: true },
    );

    await triggerBattleUpdate(damage.battle.toString());
    revalidatePath(`/dashboard/battles/${damage.battle}`);

    return {
      ok: true,
      message: "Turno atualizado com sucesso",
      data: serializeData(updatedDamage),
    };
  });
};
