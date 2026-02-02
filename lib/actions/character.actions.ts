"use server";

import { revalidatePath } from "next/cache";
import Character, { CharacterDocument } from "@/models/Character";
import { connectDB } from "../mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { getCurrentUser } from "./user.actions";
import mongoose from "mongoose";
import { getAllBattlesByCharacterId } from "./battle.actions";
import Damage from "@/models/Damage";
import { triggerBattleUpdate } from "../pusher";

const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

interface CharacterParams {
  name: string;
  owner: string;
  campaign: string;
  characterUrl?: string;
  message?: string;
  status: string;
  isNpc?: boolean;

  alignment?: "ally" | "enemy";
  isVisible?: boolean;
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
  status,
  isNpc = false,

  alignment = "ally",
  isVisible = true,
}: CharacterParams) {
  try {
    if (!name || !owner || !campaign) {
      return {
        ok: false,
        message: "Nome, proprietário e campanha são obrigatórios",
      };
    }

    await connectDB();

    if (!mongoose.isValidObjectId(campaign)) {
      return {
        ok: false,
        message: "ID da campanha inválido",
      };
    }

    const ownerData = await User.findOne({ email: owner });
    if (!ownerData) {
      return {
        ok: false,
        message: "Proprietário não encontrado",
      };
    }

    const campaignData = await Campaign.findById(campaign);
    if (!campaignData) {
      return {
        ok: false,
        message: "Campanha não encontrada",
      };
    }

    // Check if campaign is accepting characters
    if (campaignData.isAccepptingCharacters === false) {
      console.log("Campaign is NOT accepting characters. Checking owner...");
      console.log("Campaign Owner:", campaignData.owner.toString());
      console.log("Request Owner:", ownerData._id.toString());

      const isCampaignOwner =
        campaignData.owner.toString() === ownerData._id.toString();

      console.log("Is Campaign Owner?", isCampaignOwner);

      if (!isCampaignOwner) {
        return {
          ok: false,
          message:
            "Esta campanha não está aceitando novos personagens no momento.",
        };
      } else {
        console.log("Allowed because user is owner.");
      }
    } else {
      console.log(
        "Campaign IS accepting characters (or field is missing/true). Value:",
        campaignData.isAccepptingCharacters,
      );
    }

    const newCharacterData = await Character.create({
      name,
      owner: ownerData._id,
      campaign,
      characterUrl,
      message,
      status,
      isNpc,

      alignment,
      isVisible,
    });

    if (!newCharacterData) {
      return {
        ok: false,
        message: "Falha ao criar personagem",
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      ownerData._id,
      { $push: { characters: newCharacterData._id } },
      { new: true },
    );

    if (!updatedUser) {
      return {
        ok: false,
        message: "Falha ao atualizar proprietário",
      };
    }

    const newCharacter = serializeData(newCharacterData);

    revalidatePath(`/dashboard/personagens/${newCharacter._id}`);
    revalidatePath(`/dashboard/personagens`);
    revalidatePath(`/dashboard/personagens/mycharacters`);

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

export async function getCharacterById(id: string) {
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
      .populate({
        path: "campaign",
        select: "name _id owner",
        populate: {
          path: "owner",
          select: "_id name username",
        },
      });

    if (!characterData) {
      return {
        ok: false,
        message: "Personagem não encontrado",
        data: null,
      };
    }

    // Security Check: Visibility
    // If I cast to any here to avoid TS issues with populated fields not matching generic Document type effortlessly
    const charObj = characterData.toObject() as any;

    if (charObj.isVisible === false) {
      const currentUser = await getCurrentUser();
      const isCharacterOwner =
        currentUser &&
        charObj.owner._id.toString() === currentUser._id.toString();
      const isCampaignOwner =
        currentUser &&
        charObj.campaign &&
        charObj.campaign.owner._id.toString() === currentUser._id.toString();

      if (!isCharacterOwner && !isCampaignOwner) {
        return {
          ok: false,
          message: "Você não tem permissão para visualizar este personagem.",
          data: null, // Act as if not found or private
        };
      }
    }

    const battles = await getAllBattlesByCharacterId(id);

    if (!battles.ok) {
      return {
        ok: false,
        message: "Falha ao buscar batalhas do personagem",
        data: null,
      };
    }

    const damagesData = await Damage.find({ character: id }).sort({
      createdAt: -1,
    });
    const damages = serializeData(damagesData);

    const data = {
      ...charObj,
      battles: battles.data,
      damages: damages,
    };

    return {
      ok: true,
      message: "Personagem encontrado",
      data: serializeData(data),
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
  campaignId: string,
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

    const characters = charactersData;

    if (characters.length === 0) {
      return {
        ok: true,
        message: "Nenhum personagem encontrado para esta campanha",
        data: [],
      };
    }

    // Check if the current user is the owner of the campaign
    // Since we populate "campaign" in getCharacterById but here we just have campaignId,
    // we assume the caller context or we check against current user.
    // However, getCharactersByCampaign is used in the public campaign page logic too potentially.
    // Let's get the campaign owner first.

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      // Should have been caught before but just in case
      return {
        ok: true,
        message: "Campanha não encontrada",
        data: serializeData(characters), // Fallback return all? Or none?
      };
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && campaign.owner.toString() === currentUser._id.toString();

    let filteredCharacters = characters;

    if (!isOwner) {
      filteredCharacters = characters.filter((char) => {
        // If character uses the new model field isVisible (default true)
        // If isVisible is explicitly false, hide it.
        // Assuming default is true if undefined.
        return char.isVisible !== false;
      });
    }

    return {
      ok: true,
      message: "Personagens encontrados",
      data: serializeData(filteredCharacters),
    };
  } catch (error: any) {
    console.error("Error fetching campaign characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar personagens da campanha",
    };
  }
}

export async function getCharactersByOwner(): Promise<CharacterResponse> {
  try {
    await connectDB();

    const actualUser = await getCurrentUser();

    const charactersData = await Character.find({ owner: actualUser?._id })
      .populate({
        path: "campaign",
        select: "name _id",
        model: Campaign,
      })
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
  updates: Partial<CharacterParams>,
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

    if (updates.campaign && !mongoose.isValidObjectId(updates.campaign)) {
      return {
        ok: false,
        message: "ID de campanha inválido",
      };
    }

    // If changing campaign, check if the new campaign accepts characters
    if (updates.campaign) {
      const newCampaign = await Campaign.findById(updates.campaign);
      if (!newCampaign) {
        return { ok: false, message: "Nova campanha não encontrada" };
      }

      if (newCampaign.isAccepptingCharacters === false) {
        const actualUser = await getCurrentUser();
        const isCampaignOwner =
          newCampaign.owner.toString() === actualUser?._id.toString();

        if (!isCampaignOwner) {
          return {
            ok: false,
            message:
              "A campanha de destino não está aceitando novos personagens.",
          };
        }
      }
    }

    const actualUser = await getCurrentUser();
    if (!actualUser) {
      return { ok: false, message: "Usuário não autenticado" };
    }

    const characterToUpdate = await Character.findById(id).populate("campaign");
    if (!characterToUpdate) {
      return { ok: false, message: "Personagem não encontrado" };
    }

    const isCharacterOwner =
      characterToUpdate.owner.toString() === actualUser._id.toString();
    const isCampaignOwner =
      characterToUpdate.campaign.owner.toString() === actualUser._id.toString();

    if (!isCharacterOwner && !isCampaignOwner) {
      return {
        ok: false,
        message: "Você não tem permissão para editar este personagem",
      };
    }

    const updatedCharacterData = await Character.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true },
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

    const actualUser = await getCurrentUser();
    if (!actualUser) {
      return { ok: false, message: "Usuário não autenticado" };
    }

    // First get the character to know its campaign for revalidation and permission check
    const characterData = await Character.findById(id).populate("campaign");

    if (!characterData) {
      return {
        ok: false,
        message: "Personagem não encontrado",
        data: null,
      };
    }

    const isCharacterOwner =
      characterData.owner.toString() === actualUser._id.toString();
    const isCampaignOwner =
      characterData.campaign.owner.toString() === actualUser._id.toString();

    if (!isCharacterOwner && !isCampaignOwner) {
      return {
        ok: false,
        message: "Você não tem permissão para excluir este personagem",
      };
    }

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

export async function getAllCharacters(): Promise<CharacterResponse> {
  try {
    await connectDB();

    const charactersData = await Character.find({})
      .populate("owner", "username name _id")
      .populate("campaign", "name _id")
      .sort({ createdAt: -1 });

    const characters = serializeData(charactersData);

    if (characters.length === 0) {
      return {
        ok: true,
        message: "Nenhum personagem encontrado",
        data: [],
      };
    }

    return {
      ok: true,
      message: "Personagens encontrados",
      data: characters,
    };
  } catch (error: any) {
    console.error("Error fetching all characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar todos os personagens",
    };
  }
}

export async function countCharacters() {
  try {
    await connectDB();

    const count = await Character.countDocuments();

    return serializeData(count);
  } catch (error: any) {
    console.error("Error counting characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao contar personagens",
    };
  }
}

export const getCharacterByActualUser = async () => {
  await connectDB();

  const actualUser = await getCurrentUser();

  const characters = await Character.find({ owner: actualUser?._id });

  return serializeData(characters);
};

export const getCharactersByActualUserAndCampaign = async (
  campaignId: string,
) => {
  await connectDB();

  const actualUser = await getCurrentUser();
  const characters = await Character.find({
    owner: actualUser?._id,
    campaign: campaignId,
  });

  return serializeData(characters);
};
export async function updateCharacterStatus(
  characterId: string,
  status: "alive" | "dead",
): Promise<CharacterResponse> {
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

    const updatedCharacter = await Character.findByIdAndUpdate(
      characterId,
      { status },
      { new: true },
    );

    if (!updatedCharacter) {
      return {
        ok: false,
        message: "Personagem não encontrado",
      };
    }

    // Trigger update for battles involving this character
    const battles = await getAllBattlesByCharacterId(characterId);
    if (battles.ok && battles.data) {
      const activeBattles = battles.data.filter((b: any) => b.active);
      await Promise.all(
        activeBattles.map((battle: any) => triggerBattleUpdate(battle._id)),
      );
    }

    // Use revalidatePath for the battle page
    // revalidatePath(`/dashboard/battles/[id]`); // Ideally we would need the battle ID here, but this generic revalidate might not work as intended for a specific path parameter.
    // Better to revalidate strictly where needed or rely on client state updates.
    // For now, let's return data and let client handle UI or broader revalidation.

    return {
      ok: true,
      message: "Status atualizado com sucesso",
      data: serializeData(updatedCharacter),
    };
  } catch (error: any) {
    console.error("Error updating character status:", error);
    return {
      ok: false,
      message: error.message || "Falha ao atualizar status",
    };
  }
}
