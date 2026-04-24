import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface MembershipDocument {
  _id: string;
  workspace: ObjectId;
  user: ObjectId;
  role: "owner" | "admin" | "dungeon_master" | "player";
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<MembershipDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    role: {
      type: String,
      enum: ["owner", "admin", "dungeon_master", "player"],
      default: "player",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate memberships for the same user in a workspace
MembershipSchema.index({ workspace: 1, user: 1 }, { unique: true });

const Membership =
  mongoose.models?.Membership ||
  model<MembershipDocument>("Membership", MembershipSchema);
export default Membership;
