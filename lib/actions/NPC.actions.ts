"use server";

import { revalidatePath } from "next/cache";
import NPC, { NPCDocument } from "@/models/NPC";
import { connectDB } from "../mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { getCurrentUser } from "./user.actions";
import mongoose from "mongoose";

interface NPCResponse {
  ok: boolean;
  message: string;
  data?: NPCDocument | NPCDocument[] | null;
}

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

// Create NPC
export async function createNPC({
  name,
  campaign,
  imageUrl = "",
  description = "",
  status = "alive",
  visible = true,
}: Partial<NPCDocument>): Promise<NPCResponse> {
  try {
    if (!name || !campaign) {
      return {
        ok: false,
        message: "Nome e campanha são obrigatórios",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(campaign)) {
      return {
        ok: false,
        message: "ID da campanha inválido",
      };
    }

    const userData = await getCurrentUser();
    if (!userData) {
      return {
        ok: false,
        message: "Usuário não encontrado",
      };
    }

    const npcData = await NPC.create({
      name,
      owner: userData._id,
      campaign,
      imageUrl,
      description,
      status,
      visible,
    });

    if (!npcData) {
      return {
        ok: false,
        message: "Falha ao criar NPC",
      };
    }

    // Update campaign with new NPC reference
    const updateCampaign = await Campaign.findByIdAndUpdate(
      campaign,
      { $push: { npcs: npcData._id } },
      { new: true }
    );

    if (!updateCampaign) {
      return {
        ok: false,
        message: "Falha ao atualizar campanha",
      };
    }

    const newNPC = serializeData(npcData);

    revalidatePath(`/dashboard/campaigns/${campaign}`);

    return {
      ok: true,
      message: "NPC criado com sucesso!",
      data: newNPC,
    };
  } catch (error: any) {
    console.error("Error creating NPC:", error);
    return {
      ok: false,
      message: error.message || "Falha ao criar NPC",
    };
  }
}

// Get NPC by ID
export async function getNPCById(id: string): Promise<NPCResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do NPC é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de NPC inválido",
      };
    }

    const npcData = await NPC.findById(id)
      .populate("owner", "username name _id")
      .populate("campaign", "name _id");

    if (!npcData) {
      return {
        ok: false,
        message: "NPC não encontrado",
        data: null,
      };
    }

    const npc = serializeData(npcData);

    return {
      ok: true,
      message: "NPC encontrado",
      data: npc,
    };
  } catch (error: any) {
    console.error("Error fetching NPC:", error);
    return {
      ok: false,
      message: error.message || "Falha ao buscar NPC",
    };
  }
}

// Get NPCs by Campaign
export async function getNPCsByCampaign(
  campaignId: string
): Promise<NPCResponse> {
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

    const npcsData = await NPC.find({ campaign: campaignId })
      .populate("owner", "username name _id")
      .sort({ createdAt: -1 });

    const npcs = serializeData(npcsData);

    if (npcs.length === 0) {
      return {
        ok: true,
        message: "Nenhum NPC encontrado para esta campanha",
        data: [],
      };
    }

    return {
      ok: true,
      message: "NPCs encontrados",
      data: npcs,
    };
  } catch (error: any) {
    console.error("Error fetching campaign NPCs:", error);
    return {
      ok: false,
      message: error.message || "Falha ao buscar NPCs da campanha",
    };
  }
}

// Update NPC
export async function updateNPC(
  id: string,
  updates: Partial<NPCDocument>
): Promise<NPCResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do NPC é obrigatório",
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
        message: "ID de NPC inválido",
      };
    }

    const updatedNPCData = await NPC.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!updatedNPCData) {
      return {
        ok: false,
        message: "NPC não encontrado",
        data: null,
      };
    }

    const updatedNPC = serializeData(updatedNPCData);

    // Revalidate campaign page
    if (updatedNPC.campaign) {
      revalidatePath(`/dashboard/campaigns/${updatedNPC.campaign}`);
    }

    return {
      ok: true,
      message: "NPC atualizado com sucesso",
      data: updatedNPC,
    };
  } catch (error: any) {
    console.error("Error updating NPC:", error);
    return {
      ok: false,
      message: error.message || "Falha ao atualizar NPC",
    };
  }
}

// Delete NPC
export async function deleteNPC(id: string): Promise<NPCResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do NPC é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de NPC inválido",
      };
    }

    // First get the NPC to know its campaign for revalidation
    const npcData = await NPC.findById(id);

    if (!npcData) {
      return {
        ok: false,
        message: "NPC não encontrado",
        data: null,
      };
    }

    const npc = serializeData(npcData);
    const campaignId = npc.campaign;

    // Remove NPC reference from Campaign
    await Campaign.findByIdAndUpdate(campaignId, {
      $pull: { npcs: id },
    });

    // Delete the NPC
    await NPC.findByIdAndDelete(id);

    // Revalidate the campaign page
    revalidatePath(`/dashboard/campaigns/${campaignId}`);

    return {
      ok: true,
      message: "NPC excluído com sucesso",
    };
  } catch (error: any) {
    console.error("Error deleting NPC:", error);
    return {
      ok: false,
      message: error.message || "Falha ao excluir NPC",
    };
  }
}
