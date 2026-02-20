"use server";

import { revalidatePath } from "next/cache";
import NPC, { NPCDocument } from "@/models/NPC";
import { getCurrentUser } from "./user.actions";
import mongoose from "mongoose";

interface NPCResponse {
  ok: boolean;
  message: string;
  data?: NPCDocument | NPCDocument[] | null;
}

import { safeAction } from "./safe-action";
import { serializeData } from "../utils";

// Create NPC
export async function createNPC({
  name,
  campaign,
  imageUrl = "",
  description = "",
  status = "alive",
  visible = true,
}: Partial<NPCDocument>): Promise<NPCResponse> {
  return safeAction(async () => {
    if (!name || !campaign) {
      return {
        ok: false,
        message: "Nome e campanha são obrigatórios",
      };
    }

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

    const newNPC = serializeData(npcData);

    revalidatePath(`/dashboard/campaigns/${campaign}`);

    return {
      ok: true,
      message: "NPC criado com sucesso!",
      data: newNPC,
    };
  });
}

// Get NPC by ID
export async function getNPCById(id: string): Promise<NPCResponse> {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID do NPC é obrigatório",
      };
    }

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
  });
}

// Get NPCs by Campaign
// Get NPCs by Campaign
export async function getNPCsByCampaign(
  campaignId: string,
): Promise<NPCResponse> {
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
  });
}

// Update NPC
export async function updateNPC(
  id: string,
  updates: Partial<NPCDocument>,
): Promise<NPCResponse> {
  return safeAction(async () => {
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

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de NPC inválido",
      };
    }

    const updatedNPCData = await NPC.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true },
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
  });
}

// Delete NPC
export async function deleteNPC(id: string): Promise<NPCResponse> {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID do NPC é obrigatório",
      };
    }

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

    // Delete the NPC
    await NPC.findByIdAndDelete(id);

    // Revalidate the campaign page
    revalidatePath(`/dashboard/campaigns/${campaignId}`);

    return {
      ok: true,
      message: "NPC excluído com sucesso",
    };
  });
}
