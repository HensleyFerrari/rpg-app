import mongoose, { Schema, model } from "mongoose";
import { CampaignDocument } from "./Campaign";
import { CharacterDocument } from "./Character";

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatarUrl: string;
  campaigns: Array<CampaignDocument>;
  characters: Array<CharacterDocument>;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    campaigns: [
      {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || model<UserDocument>("User", UserSchema);
export default User;
