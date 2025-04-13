import { Schema, model, models } from "mongoose";

export interface FeedbackDocument {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: "em aberto" | "em desenvolvimento" | "concluido" | "negado";
  userEmail: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    title: {
      type: String,
      required: [true, "Título é obrigatório"],
    },
    description: {
      type: String,
      required: [true, "Descrição é obrigatória"],
    },
    type: {
      type: String,
      required: [true, "Tipo de feedback é obrigatório"],
      enum: ["bug", "feature", "improvement", "other"],
    },
    status: {
      type: String,
      required: true,
      enum: ["em aberto", "em desenvolvimento", "concluido", "negado"],
      default: "em aberto",
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  models?.Feedback || model<FeedbackDocument>("Feedback", FeedbackSchema);
export default Feedback;
