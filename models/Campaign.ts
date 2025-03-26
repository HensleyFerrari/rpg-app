import mongoose, { Schema, model } from "mongoose";

export interface CampaignDocument {
  _id: string;
  name: string;
  owner: string;
  sistemaUrl: string;
  message: string;
  createdAt: Date;
  updateAt: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
  {
    name: {
      type: String,
      required: [true, "Nme is required"],
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
