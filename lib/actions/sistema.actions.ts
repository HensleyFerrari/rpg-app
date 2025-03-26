"use server";

import { connectDB } from "../mongodb";
import Sistema from "@/models/Sistema";

export const getSistemas = async () => {
  await connectDB();

  const sistema = await Sistema.find();

  if (sistema.length === 0) {
    return { message: "Não existem sistemas cadastrados" };
  }
  return sistema;
};
