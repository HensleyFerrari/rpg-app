import { ObjectId } from "mongoose";
import { BattleDocument } from "@/models/Battle";
import { CampaignDocument } from "@/models/Campaign";
import { CharacterDocument } from "@/models/Character";

/**
 * Checks if the current user is the owner of a resource.
 * @param resourceOwnerId The ID of the owner of the resource.
 * @param currentUserId The ID of the current user.
 * @returns True if the user is the owner, false otherwise.
 */
export const checkOwnership = (
  resourceOwnerId: string | ObjectId | undefined,
  currentUserId: string | undefined,
): boolean => {
  if (!resourceOwnerId || !currentUserId) return false;
  return resourceOwnerId.toString() === currentUserId.toString();
};

/**
 * Verifies if the user is the master (owner) of the battle.
 * @param battle The battle document.
 * @param userId The ID of the user.
 * @returns True if the user is the battle master.
 */
export const verifyBattleMaster = (
  battle: BattleDocument | null,
  userId: string | undefined,
): boolean => {
  if (!battle || !userId) return false;
  return checkOwnership(battle.owner, userId);
};

/**
 * Verifies if the user is the owner of the campaign.
 * @param campaign The campaign document.
 * @param userId The ID of the user.
 * @returns True if the user is the campaign owner.
 */
export const verifyCampaignOwner = (
  campaign: CampaignDocument | null | undefined,
  userId: string | undefined,
): boolean => {
  if (!campaign || !userId) return false;
  return checkOwnership(campaign.owner, userId);
};

/**
 * Determines if a user can edit a character.
 * Users can edit a character if they are the character's owner OR the campaign's owner (GM).
 * @param character The character document (must have campaign populated if checking GM permissions).
 * @param userId The ID of the user.
 * @returns True if the user can edit the character.
 */
export const canEditCharacter = (
  character: CharacterDocument | null,
  userId: string | undefined,
): boolean => {
  if (!character || !userId) return false;

  if (checkOwnership(character.owner, userId)) return true;

  const campaign = character.campaign as any;
  if (campaign && campaign.owner) {
    if (typeof campaign.owner === "object" && campaign.owner._id) {
      return checkOwnership(campaign.owner._id, userId);
    }
    return checkOwnership(campaign.owner, userId);
  }

  return false;
};

/**
 * Checks if a user can view a character based on visibility rules.
 * @param character The character object.
 * @param userId The ID of the user (optional).
 * @returns True if the character is visible to the user.
 */
export const canViewCharacter = (
  character: any,
  userId: string | undefined,
): boolean => {
  if (!character) return false;

  // If character is visible, anyone can view
  if (character.isVisible !== false) return true;

  // If invisible, only owner or GM can view
  if (!userId) return false;

  // Check ownership
  const ownerId =
    typeof character.owner === "object" ? character.owner._id : character.owner;
  if (checkOwnership(ownerId, userId)) return true;

  // Check GM
  const campaignAx = character.campaign;
  if (campaignAx) {
    const campaignOwnerId =
      typeof campaignAx.owner === "object"
        ? campaignAx.owner._id
        : campaignAx.owner;
    if (checkOwnership(campaignOwnerId, userId)) return true;
  }

  return false;
};
