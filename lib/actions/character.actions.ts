"use server";

import { revalidatePath } from "next/cache";
import Character, { CharacterDocument } from "@/models/Character";
import { connectDB } from "../mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { getCurrentUser } from "./user.actions";
import mongoose from "mongoose";
import {
  getAllBattlesByCharacterId,
  getActiveBattlesByCharacterId,
} from "./battle.actions";
import Damage from "@/models/Damage";
import { triggerBattleUpdate } from "../pusher";
import { safeAction } from "./safe-action";
import { serializeData } from "../utils";
import {
  canEditCharacter,
  canViewCharacter,
  verifyCampaignOwner,
} from "../auth";

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

export async function createCharacter(params: CharacterParams) {
  return safeAction(async () => {
    const {
      name,
      owner,
      campaign,
      characterUrl = "",
      message = "",
      status,
      isNpc = false,
      alignment = "ally",
      isVisible = true,
    } = params;

    if (!name || !owner || !campaign) {
      return {
        ok: false,
        message: "Nome, proprietário e campanha são obrigatórios",
      };
    }

    // connectDB() is handled by safeAction

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

      if (!verifyCampaignOwner(campaignData, ownerData._id)) {
        return {
          ok: false,
          message:
            "Esta campanha não está aceitando novos personagens no momento.",
        };
      }
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

    await User.findByIdAndUpdate(
      ownerData._id,
      { $push: { characters: newCharacterData._id } },
      { new: true },
    );

    const newCharacter = serializeData(newCharacterData);

    revalidatePath(`/dashboard/personagens/${newCharacter._id}`);
    revalidatePath(`/dashboard/personagens`);
    revalidatePath(`/dashboard/personagens/mycharacters`);

    return {
      ok: true,
      message: "Personagem criado com sucesso!",
      data: newCharacter,
    };
  });
}

export async function getCharacterById(id: string) {
  return safeAction(async () => {
    if (!id) {
      return {
        ok: false,
        message: "ID do personagem é obrigatório",
      };
    }

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
    // We pass the mongoose document which has populated fields.
    // canViewCharacter handles checking owner and campaign owner.
    const currentUser = await getCurrentUser();
    if (!canViewCharacter(characterData, currentUser?._id)) {
      return {
        ok: false,
        message: "Você não tem permissão para visualizar este personagem.",
        data: null,
      };
    }

    const charObj = characterData.toObject();

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
  });
}

export async function getCharactersByCampaign(
  campaignId: string,
): Promise<CharacterResponse> {
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

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return {
        ok: true,
        message: "Campanha não encontrada",
        data: serializeData(characters),
      };
    }

    const currentUser = await getCurrentUser();

    // Filter characters based on visibility
    // If user is campaign owner, they see everything (handled by canViewCharacter)
    // If not, they only see visible ones or their own
    const filteredCharacters = characters.filter((char) =>
      canViewCharacter(char, currentUser?._id),
    );

    return {
      ok: true,
      message: "Personagens encontrados",
      data: serializeData(filteredCharacters),
    };
  });
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
  return safeAction(async () => {
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
        if (!verifyCampaignOwner(newCampaign, actualUser?._id)) {
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

    if (!canEditCharacter(characterToUpdate, actualUser._id)) {
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
  });
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

    if (!canEditCharacter(characterData, actualUser._id)) {
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

export async function getAccessibleCharacters(): Promise<CharacterResponse> {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        ok: false,
        message: "Usuário não autenticado",
        data: [],
      };
    }

    // Find campaigns owned by the user
    const ownedCampaigns = await Campaign.find({
      owner: currentUser._id,
    }).select("_id");
    const campaignIds = ownedCampaigns.map((c) => c._id);

    // Find characters that are either owned by the user OR belong to one of their campaigns
    const charactersData = await Character.find({
      $or: [{ owner: currentUser._id }, { campaign: { $in: campaignIds } }],
    })
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
    console.error("Error fetching accessible characters:", error);

    return {
      ok: false,
      message: error.message || "Falha ao buscar personagens acessíveis",
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
    const activeBattlesRes = await getActiveBattlesByCharacterId(characterId);
    if (activeBattlesRes.ok && activeBattlesRes.data) {
      await Promise.all(
        activeBattlesRes.data.map((battle: any) =>
          triggerBattleUpdate(battle._id),
        ),
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

export const getCharacterStatsByOwner = async () => {
  await connectDB();
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Usuário não encontrado",
    };
  }

  const [total, alive, dead, recent] = await Promise.all([
    Character.countDocuments({ owner: user._id }),
    Character.countDocuments({ owner: user._id, status: "alive" }),
    Character.countDocuments({ owner: user._id, status: "dead" }),
    Character.find({ owner: user._id })
      .populate({
        path: "campaign",
        select: "name _id",
        model: Campaign,
      })
      .sort({ createdAt: -1 })
      .limit(3),
  ]);

  return {
    ok: true,
    data: serializeData({ total, alive, dead, recent }),
  };
};
