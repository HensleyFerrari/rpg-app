import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface BattleDocument {
  _id: string;
  name: string;
  owner: ObjectId;
  campaign: ObjectId;
  characters: Array<ObjectId>;
  round: number;
  active: boolean;
  createdAt: Date;
  updateAt: Date;
}

const BattleSchema = new Schema<BattleDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    characters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Character",
      },
    ],
    round: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Battle =
  mongoose.models?.Battle || model<BattleDocument>("Battle", BattleSchema);
export default Battle;
