"use server";

import { revalidatePath } from "next/cache";
import Battle, { BattleDocument } from "@/models/Battle";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Character, { CharacterDocument } from "@/models/Character";
import { getCurrentUser } from "./user.actions";
import Damage from "@/models/Damage";

const serializeData = (data: BattleDocument[]) => {
  return JSON.parse(JSON.stringify(data));
};

export const createBattle = async (BattleParams: BattleDocument) => {
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

export const getBattleById = async (id: string) => {
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
      })
      .populate({
        path: "rounds",
        model: Damage,
        populate: {
          path: "character",
          model: Character,
        },
      });

    if (!battle) {
      return {
        ok: false,
        message: "Batalha não encontrada",
      };
    }

    return {
      ok: true,
      data: serializeData(battle),
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

    revalidatePath("/dashboard/campaigns");

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

    // Remove battle reference from Campaign
    if (battle.campaign) {
      await Campaign.updateOne(
        { _id: battle.campaign },
        { $pull: { battles: id } }
      );
    }

    // Remove battle reference from Users
    await User.updateMany({ battles: id }, { $pull: { battles: id } });

    // Delete the battle
    await Battle.findByIdAndDelete(id);

    revalidatePath("/dashboard/campaigns");

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

    // Atualiza o personagem para adicionar a batalha
    const character = await Character.findByIdAndUpdate(characterId, {
      $addToSet: { battles: battleId },
    });
    if (!character) {
      return {
        ok: false,
        message: "Personagem não encontrado",
      };
    }

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
