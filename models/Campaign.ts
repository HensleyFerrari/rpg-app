import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface CampaignDocument {
  _id: string;
  name: string;
  owner: ObjectId;
  imageUrl: string;
  description: string;
  characters: Array<ObjectId>;
  npcs: Array<ObjectId>;
  message: string;
  active: boolean;
  isAccepptingCharacters: boolean;
  createdAt: Date;
  updateAt: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
    },
    characters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Character",
      },
    ],
    isAccepptingCharacters: {
      type: Boolean,
      required: true,
      default: true,
    },
    npcs: [
      {
        type: Schema.Types.ObjectId,
        ref: "NPC",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Campaign =
  mongoose.models?.Campaign ||
  model<CampaignDocument>("Campaign", CampaignSchema);
export default Campaign;
