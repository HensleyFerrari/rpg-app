import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface WorkspaceDocument {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Workspace =
  mongoose.models?.Workspace ||
  model<WorkspaceDocument>("Workspace", WorkspaceSchema);
export default Workspace;
