import { CharacterDocument } from "@/modules/rpg/character/character.model";
import { checkOwnership } from "@/modules/platform/auth/permissions";

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
