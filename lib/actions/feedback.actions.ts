"use server";

import { connectDB } from "../mongodb";
import { getCurrentUser } from "./user.actions";
import Feedback from "@/models/Feedback";
import { revalidatePath } from "next/cache";

const serializeData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

export async function createFeedback(values: {
  title: string;
  description: string;
  type: string;
  area: string;
}) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        ok: false,
        message: "Usuário não autenticado",
      };
    }

    const feedback = await Feedback.create({
      ...values,
      userEmail: currentUser.email,
      userName: currentUser.name,
    });

    revalidatePath("/dashboard/feedback");

    return {
      ok: true,
      message: "Feedback enviado com sucesso",
      data: serializeData(feedback),
    };
  } catch (error: Error | unknown) {
    console.error("Error creating feedback:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao enviar feedback",
    };
  }
}

export async function getAllFeedbacks() {
  try {
    await connectDB();

    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    // revalidatePath("/dashboard/feedback");
    return {
      ok: true,
      message: "Feedbacks encontrados",
      data: serializeData(feedbacks),
    };
  } catch (error: Error | unknown) {
    console.error("Error fetching feedbacks:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao buscar feedbacks",
    };
  }
}
