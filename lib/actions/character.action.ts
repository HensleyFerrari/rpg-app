"use server";

import { connectDB } from "../mongodb";
import Character from "@/models/Character";

export const getCharacters = async () => {
  await connectDB();

  const characters = Character.find();

  return characters;
};
