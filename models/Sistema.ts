import mongoose, { Schema, model } from "mongoose";

export interface SistemaDocument {
  _id: string;
  name: string;
  owner: string;
  sistemaUrl: string;
  message: string;
  createdAt: Date;
  updateAt: Date;
}

const SitemaSchema = new Schema<SistemaDocument>(
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

const Sistema =
  mongoose.models?.Sistema || model<SistemaDocument>("Sistema", SitemaSchema);
export default Sistema;
