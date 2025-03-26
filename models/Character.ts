import mongoose, { Schema, model } from "mongoose";

export interface CharacterDocument {
  _id: string;
  name: string;
  owner: string;
  characterUrl: string;
  message: string;
  createdAt: Date;
  updateAt: Date;
}

const CharacterSchema = new Schema<CharacterDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Character =
  mongoose.models?.Character ||
  model<CharacterDocument>("Character", CharacterSchema);
export default Character;
