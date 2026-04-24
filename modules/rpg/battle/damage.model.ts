import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface DamageDocument {
  _id: string;
  owner: ObjectId;
  campaign: ObjectId;
  battle: ObjectId;
  type: "damage" | "heal" | "other";
  damage?: number;
  description?: string;
  isCritical: boolean;
  character?: ObjectId;
  target?: ObjectId;
  round: number;
  createdAt: Date;
  updateAt: Date;
}

const DamageSchema = new Schema<DamageDocument>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    battle: {
      type: Schema.Types.ObjectId,
      ref: "Battle",
      required: true,
    },
    damage: {
      type: Number,
      required: false,
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["damage", "heal", "other"],
      default: "damage",
    },
    isCritical: {
      type: Boolean,
      required: [true, "IsCritical is required"],
    },
    character: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: false,
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: false,
    },
    round: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Forcing model re-registration to handle schema updates in Next.js dev mode
if (mongoose.models.Damage) {
  delete (mongoose.models as any).Damage;
}

const Damage = model<DamageDocument>("Damage", DamageSchema);
export default Damage;
