"use server";

import RPGSystem, {
  IFieldDefinition,
  IAbilityDefinition,
} from "@/models/RPGSystem";
import { getCurrentUser } from "./user.actions";
import { revalidatePath } from "next/cache";
import { safeAction } from "./safe-action";
import { serializeData } from "../utils";

export async function createSystem(data: {
  name: string;
  description?: string;
}) {
  return safeAction(async () => {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated", ok: false };

    const newSystem = await RPGSystem.create({
      ...data,
      owner: user._id,
      attributes: [],
      skills: [],
      abilities: [],
      info: [],
    });

    revalidatePath("/dashboard/systems");
    return { success: true, data: serializeData(newSystem), ok: true };
  });
}

export async function getUserSystems() {
  return safeAction(async () => {
    const user = await getCurrentUser();
    if (!user) return [];

    const systems = await RPGSystem.find({ owner: user._id }).sort({
      createdAt: -1,
    });
    return serializeData(systems);
  }).then((res) => (res.ok ? res : [])); // fallback to match original return type (array)
}

export async function getSystemById(id: string) {
  return safeAction(async () => {
    const system = await RPGSystem.findById(id);
    return serializeData(system);
  }).then((res) => (res.ok ? res : null)); // fallback
}

export async function updateSystemFields(
  systemId: string,
  updateData: {
    attributes?: IFieldDefinition[];
    skills?: IFieldDefinition[];
    abilities?: IAbilityDefinition[];
    info?: IFieldDefinition[];
    hasInventory?: boolean;
    name?: string;
    description?: string;
  },
) {
  return safeAction(async () => {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated", ok: false };

    // Verify ownership
    const system = await RPGSystem.findOne({ _id: systemId, owner: user._id });
    if (!system)
      return { error: "System not found or unauthorized", ok: false };

    const updatedSystem = await RPGSystem.findByIdAndUpdate(
      systemId,
      { $set: updateData },
      { new: true },
    );

    revalidatePath(`/dashboard/systems/${systemId}`);
    return { success: true, data: serializeData(updatedSystem), ok: true };
  });
}

export async function deleteSystem(systemId: string) {
  return safeAction(async () => {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated", ok: false };

    const system = await RPGSystem.findOneAndDelete({
      _id: systemId,
      owner: user._id,
    });

    if (!system) return { error: "System not found", ok: false };

    revalidatePath("/dashboard/systems");
    return { success: true, ok: true };
  });
}
