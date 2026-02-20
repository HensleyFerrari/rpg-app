"use server";

import { revalidatePath } from "next/cache";
import Campaign, { CampaignDocument } from "@/models/Campaign";
import { findByEmail, getCurrentUser } from "./user.actions";
import mongoose from "mongoose";
import User from "@/models/User";
import { getCharactersByCampaign } from "./character.actions";
import { verifyCampaignOwner } from "../auth";
import { safeAction } from "./safe-action";

interface CampaignResponse {
  ok: boolean;
  message: string;
  data?: CampaignDocument | CampaignDocument[] | null;
}

import { serializeData } from "../utils";

export async function getCampaigns({
  query,
  filterType,
}: { query?: string; filterType?: "all" | "my" } = {}) {
  return safeAction(async () => {
    const queryObj: any = {};

    if (query) {
      queryObj.name = { $regex: query, $options: "i" };
    }

    if (filterType === "my") {
      const userData = await getCurrentUser();
      const user = await findByEmail(userData.email);
      if (user && user._id) {
        queryObj.owner = user._id;
      }
    }

    const campaigns = await Campaign.find(queryObj)
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .lean();

    return serializeData(campaigns);
  });
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
  return safeAction(async () => {
    if (!name || !email) {
      return {
        ok: false,
        message: "Nome e email são obrigatórios",
      };
    }

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

    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha criada com sucesso!",
      data: campaign,
    };
  });
};

export const getCampaignById = async (id: string) => {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const campaignData = await Campaign.findById(id).populate({
      path: "owner",
      select: "username name email _id avatarUrl",
      model: User,
    });

    if (!campaignData) {
      return {
        ok: false,
        message: "Campanha não encontrada",
        data: null,
      };
    }

    const characterData = await getCharactersByCampaign(id);

    const data = {
      ...campaignData.toObject(),
      characters: characterData.data,
    };

    const campaign = serializeData(data);

    return {
      ok: true,
      message: "Campanha encontrada com sucesso",
      data: campaign,
    };
  });
};

export const getMyCampaigns = async () => {
  return safeAction(async () => {
    const userData = await getCurrentUser();

    const user = await findByEmail(userData.email);

    if (!user || !user._id) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const campaignsData = await Campaign.find({ owner: user._id })
      .populate("owner", "username name _id avatarUrl")
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
  });
};

export const updateCampaign = async (
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    isAccepptingCharacters: boolean;
  }>,
): Promise<CampaignResponse> => {
  return safeAction(async () => {
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

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        ok: false,
        message: "Você precisa estar logado para realizar esta ação",
      };
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return {
        ok: false,
        message: "Campanha não encontrada",
      };
    }

    if (!verifyCampaignOwner(campaign, user._id)) {
      return {
        ok: false,
        message: "Você não tem permissão para editar esta campanha",
      };
    }

    // Garantir que isAccepptingCharacters seja um booleano
    if ("isAccepptingCharacters" in updates) {
      updates.isAccepptingCharacters = Boolean(updates.isAccepptingCharacters);
    }

    const updatedCampaignData = await Campaign.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true },
    );

    if (!updatedCampaignData) {
      return {
        ok: false,
        message: "Falha ao atualizar campanha",
        data: null,
      };
    }

    const updatedCampaign = serializeData(updatedCampaignData);

    revalidatePath(`/campaigns/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha atualizada com sucesso",
      data: updatedCampaign,
    };
  });
};

export const deleteCampaign = async (id: string): Promise<CampaignResponse> => {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID da campanha é obrigatório",
      };
    }

    // connectDB() is typically handled by safeAction or a global middleware
    // await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        ok: false,
        message: "Você precisa estar logado para realizar esta ação",
      };
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return {
        ok: false,
        message: "Campanha não encontrada",
      };
    }

    if (!verifyCampaignOwner(campaign, user._id)) {
      return {
        ok: false,
        message: "Você não tem permissão para excluir esta campanha",
      };
    }

    const deletedCampaign = await Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return {
        ok: false,
        message: "Falha ao excluir campanha",
        data: null,
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/campaigns");

    return {
      ok: true,
      message: "Campanha excluída com sucesso",
    };
  });
};

export const countCampaigns = async () => {
  return safeAction(async () => {
    const count = await Campaign.countDocuments();

    return serializeData(count);
  });
};

export const joinCampaign = async ({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}): Promise<CampaignResponse> => {
  return safeAction(async () => {
    if (!campaignId || !userId) {
      return {
        ok: false,
        message: "ID da campanha e ID do usuário são obrigatórios",
      };
    }

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

    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Você entrou na campanha com sucesso",
    };
  });
};

export const getCampaignStatsByUser = async () => {
  return safeAction(async () => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const [total] = await Promise.all([
      Campaign.countDocuments({ owner: user._id }),
    ]);

    return {
      ok: true,
      data: serializeData({ total }),
    };
  });
};
