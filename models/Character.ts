import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface CharacterDocument {
  _id: string;
  name: string;
  owner: ObjectId;
  campaign: ObjectId;
  characterUrl: string;
  message: string;
  status: string;
  alignment: string;
  isNpc: boolean;
  isVisible: boolean;
  createdAt: Date;
  updateAt: Date;
}

const CharacterSchema = new Schema<CharacterDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    characterUrl: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["alive", "dead"],
      default: "alive",
    },
    isNpc: {
      type: Boolean,
      default: false,
    },
    alignment: {
      type: String,
      enum: ["ally", "enemy"],
      default: "ally",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Character =
  mongoose.models?.Character ||
  model<CharacterDocument>("Character", CharacterSchema);
export default Character;
