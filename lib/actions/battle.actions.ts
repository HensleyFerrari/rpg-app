"use server";

import { revalidatePath } from "next/cache";
import Battle, { BattleDocument } from "@/models/Battle";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";
import { BattleDocument } from "../../models/Battle";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export const createBattle = async ({ BattleParams }: BattleDocument) => {
  try {
    await connectDB();

    const newBattle = await Battle.create(BattleParams);

    revalidatePath("/dashboard/campaigns");

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

    const battle = await Battle.findById(id).populate("characters");

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
