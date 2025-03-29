"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../mongodb";
import Campaign from "@/models/Campaign";
import { findByEmail, updateUserCampaign } from "./user.actions";
import mongoose from "mongoose";

interface CampaignResponse {
  ok: boolean;
  message: string;
  data?: any;
}

// Add this helper function at the top of the file
const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export async function getCampaigns() {
  try {
    await connectDB();

    const campaigns = await Campaign.find({})
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .lean();

    return campaigns.map((campaign) => ({
      ...campaign,
    }));
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    throw new Error(
      "Falha ao carregar campanhas. Por favor, tente novamente mais tarde."
    );
  }
}

type createCamp = {
  name: string;
  email: string;
  description?: string;
  imageUrl?: string;
};

export const createCampaign = async ({
  name,
  email,
  description = "",
  imageUrl = "",
}: createCamp): Promise<CampaignResponse> => {
  try {
    if (!name || !email) {
      return {
        ok: false,
        message: "Nome e email são obrigatórios",
      };
    }

    await connectDB();

    const user = await findByEmail(email);

    if (!user || !user._id) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const data = {
      name,
      owner: user._id,
      description,
      imageUrl,
    };

    const campaignData = await Campaign.create(data);

    if (!campaignData) {
      return {
        ok: false,
        message: "Falha ao criar campanha",
      };
    }

    // Serialize the MongoDB document
    const campaign = serializeData(campaignData);

    const updatedUser = await updateUserCampaign({
      campaign: campaign._id,
      _id: user._id,
    });

    if (!updatedUser) {
      // Rollback campaign creation if user update fails
      await Campaign.findByIdAndDelete(campaign._id);
      return {
        ok: false,
        message: "Erro ao atualizar usuário com a nova campanha",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha criada com sucesso!",
      data: campaign,
    };
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return {
      ok: false,
      message: error.message || "Não foi possível criar sua campanha",
    };
  }
};

export const getCampaignById = async (
  id: string
): Promise<CampaignResponse> => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }
    const campaignData = await Campaign.findById(id)
      .populate("owner", "username email name _id")
      .populate({
        path: "characters",
        populate: {
          path: "owner",
          model: "User",
          select: "username name _id",
        },
      });

    if (!campaignData) {
      return {
        ok: false,
        message: "Campanha não encontrada",
        data: null,
      };
    }

    // Serialize the MongoDB document
    const campaign = serializeData(campaignData);

    return {
      ok: true,
      message: "Campanha encontrada com sucesso",
      data: campaign,
    };
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return {
      ok: false,
      message: error.message || "Falha ao buscar campanha",
    };
  }
};

export const getMyCampaigns = async ({
  email,
}: {
  email: string;
}): Promise<CampaignResponse> => {
  try {
    if (!email) {
      return {
        ok: false,
        message: "Email é obrigatório",
      };
    }

    await connectDB();

    const user = await findByEmail(email);

    if (!user || !user._id) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const campaignsData = await Campaign.find({ owner: user._id })
      .populate("owner", "username name _id")
      .sort({
        createdAt: -1,
      });

    // Serialize the MongoDB documents
    const campaigns = serializeData(campaignsData);

    if (campaigns.length === 0) {
      return {
        ok: true,
        message: "Você não possui campanhas",
        data: [],
      };
    }

    return {
      ok: true,
      message: "Campanhas encontradas com sucesso",
      data: campaigns,
    };
  } catch (error: any) {
    console.error("Error fetching user campaigns:", error);
    return {
      ok: false,
      message: error.message || "Falha ao buscar suas campanhas",
    };
  }
};

export const updateCampaign = async (
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    imageUrl: string;
  }>
): Promise<CampaignResponse> => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    if (Object.keys(updates).length === 0) {
      return {
        ok: false,
        message: "Nenhuma atualização fornecida",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const updatedCampaignData = await Campaign.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!updatedCampaignData) {
      return {
        ok: false,
        message: "Campanha não encontrada",
        data: null,
      };
    }

    // Serialize the MongoDB document
    const updatedCampaign = serializeData(updatedCampaignData);

    revalidatePath(`/campaigns/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha atualizada com sucesso",
      data: updatedCampaign,
    };
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return {
      ok: false,
      message: error.message || "Falha ao atualizar campanha",
    };
  }
};

export const deleteCampaign = async (id: string): Promise<CampaignResponse> => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const deletedCampaign = await Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return {
        ok: false,
        message: "Campanha não encontrada",
        data: null,
      };
    }

    // Note: You might need to also remove the campaign reference from users
    // and delete associated characters depending on your requirements

    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha excluída com sucesso",
    };
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return {
      ok: false,
      message: error.message || "Falha ao excluir campanha",
    };
  }
};

export const countCampaigns = async (): Promise<number | CampaignResponse> => {
  try {
    await connectDB();

    const count = await Campaign.countDocuments();

    return count;
  } catch (error: any) {
    console.error("Error counting campaigns:", error);
    return {
      ok: false,
      message: error.message || "Falha ao contar campanhas",
    };
  }
};

export const joinCampaign = async ({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<CampaignResponse> => {
  try {
    if (!campaignId || !userId) {
      return {
        ok: false,
        message: "ID da campanha e ID do usuário são obrigatórios",
      };
    }

    await connectDB();

    if (
      !mongoose.isValidObjectId(campaignId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return {
        ok: false,
        message: "IDs inválidos",
      };
    }

    // First check if the campaign exists
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return {
        ok: false,
        message: "Campanha não encontrada",
      };
    }

    // Add user to campaign (this depends on your Campaign schema)
    // If you have a players array in your Campaign model
    // const updatedCampaign = await Campaign.findByIdAndUpdate(
    //   campaignId,
    //   { $addToSet: { players: userId } },
    //   { new: true }
    // );

    // Update user's campaigns list
    const updatedUser = await updateUserCampaign({
      campaign: campaignId,
      _id: userId,
    });

    if (!updatedUser) {
      return {
        ok: false,
        message: "Falha ao adicionar usuário à campanha",
      };
    }

    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Você entrou na campanha com sucesso",
    };
  } catch (error: any) {
    console.error("Error joining campaign:", error);
    return {
      ok: false,
      message: error.message || "Falha ao entrar na campanha",
    };
  }
};
