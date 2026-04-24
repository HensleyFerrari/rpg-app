import { BattleDocument } from "@/modules/rpg/battle/battle.model";
import { checkOwnership } from "@/modules/platform/auth/permissions";

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
