import { ObjectId } from "mongoose";

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
