import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface InviteDocument {
  _id: string;
  workspace: ObjectId;
  email: string;
  role: "admin" | "dungeon_master" | "player";
  token: string;
  status: "pending" | "accepted" | "revoked";
  invitedBy: ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<InviteDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    role: {
      type: String,
      enum: ["admin", "dungeon_master", "player"],
      default: "player",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Invited by is required"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple pending invites for the same email in the same workspace
InviteSchema.index(
  { workspace: 1, email: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

const Invite =
  mongoose.models?.Invite || model<InviteDocument>("Invite", InviteSchema);
export default Invite;
