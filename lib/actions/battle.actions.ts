"use server";

import { revalidatePath } from "next/cache";
import Battle, { BattleDocument } from "@/models/Battle";
import mongoose from "mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Character, { CharacterDocument } from "@/models/Character";
import { getCurrentUser } from "./user.actions";
import { getAllDamagesByBattleId } from "./damage.actions";
import { triggerBattleUpdate } from "../pusher";
import { safeAction } from "./safe-action";
import { serializeData } from "../utils";
import { verifyBattleMaster } from "../auth";

export const createBattle = async (BattleParams: any) => {
  return safeAction(async () => {
    const userData = await getCurrentUser();

    const newBattle = await Battle.create({
      name: BattleParams.name,
      campaign: BattleParams.campaign,
      active: BattleParams.active,
      round: 1,
      characters: BattleParams.characters || [],
      owner: userData._id,
      is_visible_to_players: BattleParams.is_visible_to_players || false,
    });

    revalidatePath("/dashboard/battles");

    return {
      ok: true,
      message: "Batalha criada com sucesso",
      data: serializeData(newBattle),
    };
  });
};

export const getBattleById = async (id: any) => {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
      };
    }

    const battle = await Battle.findById(id)
      .populate({
        path: "characters",
        model: Character,
      })
      .populate({
        path: "owner",
        model: User,
        select: "name _id",
      })
      .populate({
        path: "campaign",
        model: Campaign,
      });

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    const damages = await getAllDamagesByBattleId(id);

    if (!damages.ok) {
      return {
        ok: false,
        message: "Erro ao obter danos da batalha",
      };
    }

    const data = {
      ...battle.toObject(),
      rounds: damages.data,
    };

    return {
      ok: true,
      data: serializeData(data),
    };
  });
};

export const getBattlesByCampaign = async (campaignId: string) => {
  return safeAction(async () => {
    if (!campaignId) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(campaignId)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const battles = await Battle.find({ campaign: campaignId }).populate(
      "characters",
    );

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const getAllBattlesByCharacterId = async (characterId: string) => {
  return safeAction(async () => {
    if (!characterId) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(characterId)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    const battles = await Battle.find({ characters: characterId });

    if (battles.length === 0) {
      return {
        ok: true,
        message: "Esse personagem não está em nenhuma batalha",
        data: [],
      };
    }

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const getActiveBattlesByCharacterId = async (characterId: string) => {
  return safeAction(async () => {
    if (!characterId) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(characterId)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    const battles = await Battle.find({
      characters: characterId,
      active: true,
    });

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const updateBattle = async (
  id: string,
  battleParams: Partial<BattleDocument>,
) => {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    if (!battleParams) {
      return {
        ok: false,
        message: "Dados da batalha são obrigatórios",
      };
    }

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
      };
    }

    const userData = await getCurrentUser();
    if (!userData) {
      return {
        ok: false,
        message: "Usuário não autenticado",
      };
    }

    const existingBattle = await Battle.findById(id);
    if (!existingBattle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    if (!verifyBattleMaster(existingBattle, userData._id)) {
      return {
        ok: false,
        message: "Apenas o mestre pode atualizar esta batalha",
      };
    }

    const battle = await Battle.findByIdAndUpdate(id, battleParams, {
      new: true,
    });

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    await triggerBattleUpdate(id);
    revalidatePath(`/dashboard/battles/${id}`);

    return {
      ok: true,
      data: serializeData(battle),
    };
  });
};

export const deleteBattle = async (id: string) => {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
      };
    }

    // Find the battle first to get its campaign and other references
    const battle = await Battle.findById(id);

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    const userData = await getCurrentUser();
    if (!verifyBattleMaster(battle, userData?._id)) {
      return {
        ok: false,
        message: "Apenas o mestre pode deletar esta batalha",
      };
    }

    await Battle.findByIdAndDelete(id);

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/battles");

    return {
      ok: true,
      message: "Batalha deletada com sucesso",
    };
  });
};

export const getBattles = async ({
  query,
  filterType,
  campaignId,
}: {
  query?: string;
  filterType?: "all" | "my";
  campaignId?: string;
} = {}) => {
  return safeAction(async () => {
    const queryObj: any = {};

    if (query) {
      queryObj.name = { $regex: query, $options: "i" };
    }

    if (filterType === "my") {
      const userData = await getCurrentUser();
      if (userData && userData._id) {
        queryObj.owner = userData._id;
      }
    }

    if (campaignId && campaignId !== "all") {
      if (mongoose.isValidObjectId(campaignId)) {
        queryObj.campaign = campaignId;
      }
    }

    const battles = await Battle.find(queryObj)
      .populate({
        path: "owner",
        select: "name",
        model: User,
      })
      .populate({
        path: "campaign",
        select: "name imageUrl",
        model: Campaign,
      })
      .sort({ createdAt: -1 });

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const getAllBattles = async () => {
  return safeAction(async () => {
    const battles = await Battle.find()
      .populate({
        path: "owner",
        select: "name",
        model: User,
      })
      .populate({
        path: "campaign",
        select: "name imageUrl",
        model: Campaign,
      });

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const addCharacterToBattle = async (
  battleId: string,
  characterId: string,
) => {
  return safeAction(async () => {
    if (!battleId || !characterId) {
      return {
        ok: false,
        message: "ID da batalha e do personagem são obrigatórios",
      };
    }

    if (!mongoose.isValidObjectId(battleId)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
      };
    }

    if (!mongoose.isValidObjectId(characterId)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    // Verifica se o personagem já está na batalha
    const battleVerify = await Battle.findById(battleId);
    if (!battleVerify) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    const userData = await getCurrentUser();
    if (!verifyBattleMaster(battleVerify, userData?._id)) {
      return {
        ok: false,
        message: "Apenas o mestre pode adicionar personagens à batalha",
        data: null,
      };
    }

    const characterExists = battleVerify.characters.some(
      (character: CharacterDocument) => character.toString() === characterId,
    );
    if (characterExists) {
      return {
        ok: false,
        message: "Personagem já está na batalha",
      };
    }

    const battle = await Battle.findByIdAndUpdate(
      battleId,
      { $addToSet: { characters: characterId } },
      { new: true },
    );

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    await triggerBattleUpdate(battleId);
    revalidatePath(`/dashboard/battles/${battleId}`);

    return {
      ok: true,
      data: serializeData(battle),
    };
  });
};

export const removeCharacterFromBattle = async (
  characterId: string,
  battleId: string,
) => {
  return safeAction(async () => {
    if (!battleId || !characterId) {
      return {
        ok: false,
        message: "ID da batalha e do personagem são obrigatórios",
      };
    }

    if (!mongoose.isValidObjectId(battleId)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
      };
    }

    if (!mongoose.isValidObjectId(characterId)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    const battleToCheck = await Battle.findById(battleId);
    if (!battleToCheck) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    const userData = await getCurrentUser();
    // Allow GM to remove.
    // TODO: Determine if character owner can also remove themselves (leave battle).
    // For now, restricting to GM as requested in security audit.
    if (!verifyBattleMaster(battleToCheck, userData?._id)) {
      return {
        ok: false,
        message: "Apenas o mestre pode remover personagens da batalha",
      };
    }

    const battle = await Battle.findByIdAndUpdate(
      battleId,
      { $pull: { characters: characterId } },
      { new: true },
    );

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    await triggerBattleUpdate(battleId);
    revalidatePath(`/dashboard/battles/${battleId}`);

    return {
      ok: true,
      message: "Personagem removido da batalha com sucesso",
      data: serializeData(battle),
    };
  });
};

export const getAllBattlesByUser = async () => {
  return safeAction(async () => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const battles = await Battle.find({ owner: user._id })
      .populate({
        path: "owner",
        select: "name",
        model: User,
      })
      .populate({
        path: "campaign",
        select: "name imageUrl",
        model: Campaign,
      });

    return {
      ok: true,
      data: serializeData(battles),
    };
  });
};

export const createQuickCharacters = async (
  battleId: string,
  names: string[],
  alignment: "ally" | "enemy" = "ally",
) => {
  return safeAction(async () => {
    if (!battleId) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    if (!names || names.length === 0) {
      return {
        ok: false,
        message: "Nomes dos personagens são obrigatórios",
      };
    }

    const battle = await Battle.findById(battleId);
    const userData = await getCurrentUser();

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    if (!verifyBattleMaster(battle, userData?._id)) {
      return {
        ok: false,
        message: "Apenas o mestre pode criar personagens rápidos",
      };
    }

    const charactersToCreate = names.map((name) => ({
      name,
      owner: battle.owner,
      campaign: battle.campaign,
      status: "alive",
      alignment,
      isNpc: true,
    }));

    const createdCharacters = await Character.insertMany(charactersToCreate);
    const characterIds = createdCharacters.map((char) => char._id);

    const updatedBattle = await Battle.findByIdAndUpdate(
      battleId,
      { $addToSet: { characters: { $each: characterIds } } },
      { new: true },
    );

    await triggerBattleUpdate(battleId);
    revalidatePath(`/dashboard/battles/${battleId}`);

    return {
      ok: true,
      data: serializeData(updatedBattle),
      message: `${createdCharacters.length} personagens criados e adicionados com sucesso`,
    };
  });
};

export const getBattleStatsByUser = async () => {
  return safeAction(async () => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const [total, active, recent] = await Promise.all([
      Battle.countDocuments({ owner: user._id }),
      Battle.countDocuments({ owner: user._id, active: true }),
      Battle.find({ owner: user._id })
        .populate({
          path: "owner",
          select: "name",
          model: User,
        })
        .populate({
          path: "campaign",
          select: "name imageUrl",
          model: Campaign,
        })
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    return {
      ok: true,
      data: serializeData({ total, active, recent }),
    };
  });
};
