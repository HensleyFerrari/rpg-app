"use server";

import { revalidatePath } from "next/cache";
import Character, { CharacterDocument } from "@/models/Character";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

interface CharacterParams {
  name: string;
  owner: string;
  campaign: string;
  characterUrl?: string;
  message?: string;
}

interface CharacterResponse {
  ok: boolean;
  message: string;
  data?: CharacterDocument | CharacterDocument[] | null;
}

export async function createCharacter({
  name,
  owner,
  campaign,
  characterUrl = "",
  message = "",
}: CharacterParams): Promise<CharacterResponse> {
  try {
    if (!name || !owner || !campaign) {
      return {
        ok: false,
        message: "Nome, proprietário e campanha são obrigatórios",
      };
    }

    await connectDB();

    // Validate ObjectIds
    if (
      !mongoose.isValidObjectId(owner) ||
      !mongoose.isValidObjectId(campaign)
    ) {
      return {
        ok: false,
        message: "ID de proprietário ou campanha inválido",
      };
    }

    const newCharacterData = await Character.create({
      name,
      owner,
      campaign,
      characterUrl,
      message,
    });

    const newCharacter = serializeData(newCharacterData);

    revalidatePath(`/campaigns/${campaign}`);

    return {
      ok: true,
      message: "Personagem criado com sucesso!",
      data: newCharacter,
    };
  } catch (error: any) {
    console.error("Error creating character:", error);

    return {
      ok: false,
      message: error.message || "Falha ao criar personagem",
    };
  }
}

export async function getCharacterById(id: string): Promise<CharacterResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    const characterData = await Character.findById(id)
      .populate("owner", "username name _id")
      .populate("campaign", "name _id");

    if (!characterData) {
      return {
        ok: false,
        message: "Personagem não encontrado",
        data: null,
      };
    }

    const character = serializeData(characterData);

    return {
      ok: true,
      message: "Personagem encontrado",
      data: character,
    };
  } catch (error: any) {
    console.error("Error fetching character:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar personagem",
    };
  }
}

export async function getCharactersByCampaign(
  campaignId: string
): Promise<CharacterResponse> {
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

    const charactersData = await Character.find({ campaign: campaignId })
      .populate("owner", "username name _id")
      .sort({ createdAt: -1 });

    const characters = serializeData(charactersData);

    if (characters.length === 0) {
      return {
        ok: true,
        message: "Nenhum personagem encontrado para esta campanha",
        data: [],
      };
    }

    return {
      ok: true,
      message: "Personagens encontrados",
      data: characters,
    };
  } catch (error: any) {
    console.error("Error fetching campaign characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar personagens da campanha",
    };
  }
}

export async function getCharactersByOwner(
  ownerId: string
): Promise<CharacterResponse> {
  try {
    if (!ownerId) {
      return {
        ok: false,
        message: "ID do proprietário é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(ownerId)) {
      return {
        ok: false,
        message: "ID de proprietário inválido",
      };
    }

    const charactersData = await Character.find({ owner: ownerId })
      .populate("campaign", "name _id")
      .sort({ createdAt: -1 });

    const characters = serializeData(charactersData);

    if (characters.length === 0) {
      return {
        ok: true,
        message: "Nenhum personagem encontrado para este usuário",
        data: [],
      };
    }

    return {
      ok: true,
      message: "Personagens encontrados",
      data: characters,
    };
  } catch (error: any) {
    console.error("Error fetching owner characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar personagens do usuário",
    };
  }
}

export async function updateCharacter(
  id: string,
  updates: Partial<CharacterParams>
): Promise<CharacterResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
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
        message: "ID de personagem inválido",
      };
    }

    // Validate campaign and owner IDs if they are being updated
    if (updates.campaign && !mongoose.isValidObjectId(updates.campaign)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    if (updates.owner && !mongoose.isValidObjectId(updates.owner)) {
      return {
        ok: false,
        message: "ID de proprietário inválido",
      };
    }

    const updatedCharacterData = await Character.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!updatedCharacterData) {
      return {
        ok: false,
        message: "Personagem não encontrado",
        data: null,
      };
    }

    const updatedCharacter = serializeData(updatedCharacterData);

    // Revalidate campaign page to show updated character
    if (updatedCharacter.campaign) {
      revalidatePath(`/campaigns/${updatedCharacter.campaign}`);
    }

    return {
      ok: true,
      message: "Personagem atualizado com sucesso",
      data: updatedCharacter,
    };
  } catch (error: any) {
    console.error("Error updating character:", error);

    return {
      ok: false,
      message: error.message || "Falha ao atualizar personagem",
    };
  }
}

export async function deleteCharacter(id: string): Promise<CharacterResponse> {
  try {
    if (!id) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return {
        ok: false,
        message: "ID de personagem inválido",
      };
    }

    // First get the character to know its campaign for revalidation
    const characterData = await Character.findById(id);

    if (!characterData) {
      return {
        ok: false,
        message: "Personagem não encontrado",
        data: null,
      };
    }

    const character = serializeData(characterData);

    const campaignId = character.campaign;

    // Delete the character
    await Character.findByIdAndDelete(id);

    // Revalidate the campaign page
    revalidatePath(`/campaigns/${campaignId}`);

    return {
      ok: true,
      message: "Personagem excluído com sucesso",
    };
  } catch (error: any) {
    console.error("Error deleting character:", error);

    return {
      ok: false,
      message: error.message || "Falha ao excluir personagem",
    };
  }
}

export async function countCharacters(): Promise<
  number | { ok: false; message: string }
> {
  try {
    await connectDB();

    const count = await Character.countDocuments();

    return count;
  } catch (error: any) {
    console.error("Error counting characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao contar personagens",
    };
  }
}
