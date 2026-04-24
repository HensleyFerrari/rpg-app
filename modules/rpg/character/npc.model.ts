import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface NPCDocument {
  _id: string;
  name: string;
  owner: ObjectId;
  campaign: ObjectId;
  imageUrl: string;
  description: string;
  status: string;
  visible: boolean;
  createdAt: Date;
  updateAt: Date;
}

const NPCSchema = new Schema<NPCDocument>(
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
    imageUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["alive", "dead", "unknown"],
      default: "alive",
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NPC = mongoose.models?.NPC || model<NPCDocument>("NPC", NPCSchema);
export default NPC;
