import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface DamageDocument {
  _id: string;
  owner: ObjectId;
  campaign: ObjectId;
  battle: ObjectId;
  damage: number;
  isCritical: boolean;
  character: ObjectId;
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
      required: [true, "Damage is required"],
    },
    isCritical: {
      type: Boolean,
      required: [true, "IsCritical is required"],
    },
    character: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Damage =
  mongoose.models?.Damage || model<DamageDocument>("Damage", DamageSchema);
export default Damage;
