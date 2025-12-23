import mongoose, { Schema, model, models } from "mongoose";

const FieldDefinitionSchema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ["text", "number", "textarea", "boolean"], default: "text" },
  defaultValue: { type: Schema.Types.Mixed },
  required: { type: Boolean, default: false },
  // Skill specific
  linkedAttribute: { type: String }, // Key of the attribute
  rollType: { type: String }, // e.g. "d20", "d6", "dice_pool"
});

const AbilityDefinitionSchema = new Schema({
    name: { type: String, required: true },
    key: { type: String, required: true },
    description: { type: String },
    rollFormula: { type: String }, // e.g. "3d6 + 5"
    cost: { type: String }, // e.g. "5 MP"
});

export interface IFieldDefinition {
  name: string;
  key: string;
  type: "text" | "number" | "textarea" | "boolean";
  defaultValue?: any;
  required: boolean;
  linkedAttribute?: string;
  rollType?: string;
  _id?: string;
}

export interface IAbilityDefinition {
    name: string;
    key: string;
    description: string;
    rollFormula: string;
    cost: string;
    _id?: string;
}

const RPGSystemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    // Core Attributes (Str, Dex, etc.)
    attributes: [FieldDefinitionSchema],
    
    // Skills (Stealth, etc.)
    skills: [FieldDefinitionSchema],
    
    // Abilities/Spells/Feats
    abilities: [AbilityDefinitionSchema],
    
    // Bio/Info fields (Age, Race, Class - if open text)
    info: [FieldDefinitionSchema],
    
    // Modules
    hasInventory: { type: Boolean, default: true },
    
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface RPGSystemDocument extends mongoose.Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  attributes: IFieldDefinition[];
  skills: IFieldDefinition[];
  abilities: IAbilityDefinition[];
  info: IFieldDefinition[];
  hasInventory: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RPGSystem = models.RPGSystem || model<RPGSystemDocument>("RPGSystem", RPGSystemSchema);

export default RPGSystem;
