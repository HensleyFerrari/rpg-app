import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface CampaignDocument {
  _id: string;
  name: string;
  owner:
    | ObjectId
    | {
        _id: string;
        email: string;
        name?: string;
        username?: string;
        avatarUrl?: string;
      }; // Adjusted for populated owner
  imageUrl: string;
  description: string;
  message: string;
  active: boolean;
  attributes: Array<{ name: string; _id?: string }>; // Corrected type
  skills: Array<{ name: string; attribute: string; _id?: string }>; // Corrected type
  isAcceptingCharacters: boolean;
  createdAt: Date;
  updateAt: Date;
}
// TODO: Adicionar pericias no modelo das campanhas

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
    attributes: [
      { name: { type: String, required: [true, "Name is required"] } },
    ],
    skills: [
      {
        name: { type: String, required: true },
        attribute: { type: String, required: true },
      },
    ],
    isAcceptingCharacters: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign =
  mongoose.models?.Campaign ||
  model<CampaignDocument>("Campaign", CampaignSchema);
export default Campaign;
