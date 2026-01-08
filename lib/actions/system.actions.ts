"use server";

import { connectDB } from "../mongodb";
import RPGSystem, { IFieldDefinition, IAbilityDefinition } from "@/models/RPGSystem";
import { getCurrentUser } from "./user.actions";
import { revalidatePath } from "next/cache";

// Ensure data is serializable for Client Components
const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export async function createSystem(data: {
  name: string;
  description?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    await connectDB();

    const newSystem = await RPGSystem.create({
      ...data,
      owner: user._id,
      attributes: [],
      skills: [],
      abilities: [],
      info: []
    });

    revalidatePath("/dashboard/systems");
    return { success: true, data: serializeData(newSystem) };
  } catch (error) {
    console.error("Error creating system:", error);
    return { error: "Failed to create system" };
  }
}

export async function getUserSystems() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectDB();
    const systems = await RPGSystem.find({ owner: user._id }).sort({ createdAt: -1 });
    return serializeData(systems);
  } catch (error) {
    console.error("Error fetching systems:", error);
    return [];
  }
}

export async function getSystemById(id: string) {
  try {
    await connectDB();
    const system = await RPGSystem.findById(id);
    return serializeData(system);
  } catch {
    return null;
  }
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
  }
) {
  try {
     const user = await getCurrentUser();
     if (!user) return { error: "Not authenticated" };

     await connectDB();
     
     // Verify ownership
     const system = await RPGSystem.findOne({ _id: systemId, owner: user._id });
     if (!system) return { error: "System not found or unauthorized" };

     const updatedSystem = await RPGSystem.findByIdAndUpdate(
       systemId,
       { $set: updateData },
       { new: true }
     );
     
     revalidatePath(`/dashboard/systems/${systemId}`);
     return { success: true, data: serializeData(updatedSystem) };
  } catch (error) {
    console.error("Error updating system:", error);
    return { error: "Failed to update system" };
  }
}

export async function deleteSystem(systemId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: "Not authenticated" };
   
        await connectDB();
        const system = await RPGSystem.findOneAndDelete({ _id: systemId, owner: user._id });
        
        if (!system) return { error: "System not found" };
        
        revalidatePath("/dashboard/systems");
        return { success: true };
    } catch {
        return { error: "Failed to delete" };
    }
}
