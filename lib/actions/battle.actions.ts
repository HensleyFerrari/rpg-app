"use server";

import { revalidatePath } from "next/cache";
import Battle, { BattleDocument } from "@/models/Battle";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Character, { CharacterDocument } from "@/models/Character";
import { getCurrentUser } from "./user.actions";
import { getAllDamagesByBattleId } from "./damage.actions";
import { triggerBattleUpdate } from "../pusher";

const serializeData = (data: BattleDocument[]) => {
  return JSON.parse(JSON.stringify(data));
};

export const createBattle = async (BattleParams: any) => {
  try {
    await connectDB();

    const userData = await getCurrentUser();

    const newBattle = await Battle.create({
      name: BattleParams.name,
      campaign: BattleParams.campaign,
      active: BattleParams.active,
      round: 1,
      characters: BattleParams.characters || [],
      owner: userData._id,
    });

    revalidatePath("/dashboard/battles");

    return {
      ok: true,
      message: "Batalha criada com sucesso",
      data: serializeData(newBattle),
    };
  } catch (error) {
    console.error("Error creating battle:", error);
    return {
      ok: false,
      message: "Erro ao criar batalha",
    };
  }
};

export const getBattleById = async (id: any) => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    await connectDB();

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
  } catch (error) {
    console.error("Error getting battle:", error);
    return {
      ok: false,
      message: "Erro ao obter batalha",
    };
  }
};

export const getBattlesByCampaign = async (campaignId: string) => {
  try {
    if (!campaignId) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(campaignId)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const battles = await Battle.find({ campaign: campaignId }).populate(
      "characters"
    );

    return {
      ok: true,
      data: serializeData(battles),
    };
  } catch (error) {
    console.error("Error getting battles:", error);
    return {
      ok: false,
      message: "Erro ao obter batalhas",
    };
  }
};

export const getAllBattlesByCharacterId = async (characterId: string) => {
  try {
    if (!characterId) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

    await connectDB();

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
  } catch (error) {
    console.error("Error getting battles by character:", error);
    return {
      ok: false,
      message: "Erro ao obter batalhas por personagem",
    };
  }
};

export const updateBattle = async (
  id: string,
  battleParams: Partial<BattleDocument>
) => {
  try {
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

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de batalha inválido",
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
  } catch (error) {
    console.error("Error updating battle:", error);
    return {
      ok: false,
      message: "Erro ao atualizar batalha",
    };
  }
};

export const deleteBattle = async (id: string) => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID da batalha é obrigatório",
      };
    }

    await connectDB();

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

    await Battle.findByIdAndDelete(id);

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/battles");

    return {
      ok: true,
      message: "Batalha deletada com sucesso",
    };
  } catch (error) {
    console.error("Error deleting battle:", error);
    return {
      ok: false,
      message: "Erro ao deletar batalha",
    };
  }
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
  try {
    await connectDB();

    let queryObj: any = {};

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
  } catch (error) {
    console.error("Error getting battles:", error);
    return {
      ok: false,
      message: "Erro ao buscar batalhas",
      data: [],
    };
  }
};


export const getAllBattles = async () => {
  await connectDB();

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
};

export const addCharacterToBattle = async (
  battleId: string,
  characterId: string
) => {
  try {
    if (!battleId || !characterId) {
      return {
        ok: false,
        message: "ID da batalha e do personagem são obrigatórios",
      };
    }

    await connectDB();

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
    const characterExists = battleVerify.characters.some(
      (character: CharacterDocument) => character.toString() === characterId
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
      { new: true }
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
  } catch (error) {
    console.error("Error adding character to battle:", error);
    return {
      ok: false,
      message: "Erro ao adicionar personagem à batalha",
    };
  }
};

export const removeCharacterFromBattle = async (
  characterId: string,
  battleId: string
) => {
  try {
    if (!battleId || !characterId) {
      return {
        ok: false,
        message: "ID da batalha e do personagem são obrigatórios",
      };
    }

    await connectDB();

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

    const battle = await Battle.findByIdAndUpdate(
      battleId,
      { $pull: { characters: characterId } },
      { new: true }
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
  } catch (error) {
    console.error("Error removing character from battle:", error);
    return {
      ok: false,
      message: "Erro ao remover personagem da batalha",
    };
  }
};

export const getAllBattlesByUser = async () => {
  await connectDB();
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
};

export const createQuickCharacters = async (
  battleId: string,
  names: string[],
  alignment: "ally" | "enemy" = "ally"
) => {
  try {
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

    await connectDB();

    const battle = await Battle.findById(battleId);

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
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
      { new: true }
    );

    await triggerBattleUpdate(battleId);
    revalidatePath(`/dashboard/battles/${battleId}`);

    return {
      ok: true,
      data: serializeData(updatedBattle),
      message: `${createdCharacters.length} personagens criados e adicionados com sucesso`,
    };
  } catch (error) {
    console.error("Error creating quick characters:", error);
    return {
      ok: false,
      message: "Erro ao criar personagens rápidos",
    };
  }
};
