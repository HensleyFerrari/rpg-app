import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface CampaignDocument {
  _id: string;
  name: string;
  owner: ObjectId;
  imageUrl: string;
  description: string;
  message: string;
  active: boolean;
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
  },
  {
    timestamps: true,
  }
);

const Campaign =
  mongoose.models?.Campaign ||
  model<CampaignDocument>("Campaign", CampaignSchema);
export default Campaign;
