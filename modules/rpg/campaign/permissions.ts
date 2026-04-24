import { CampaignDocument } from "@/modules/rpg/campaign/campaign.model";
import { checkOwnership } from "@/modules/platform/auth/permissions";

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
