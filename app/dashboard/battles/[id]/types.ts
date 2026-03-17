export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface BattleCharacter {
  _id: string;
  name: string;
  active: boolean;
  status: string;
  alignment?: "ally" | "enemy";
  owner: string;
  characterUrl?: string;
  isNpc?: boolean;
}

export interface BattleRoundEntry {
  _id: string;
  damage: number;
  type?: "damage" | "heal" | "other";
  description?: string;
  round: number;
  isCritical: boolean;
  character?: {
    _id: string;
    name: string;
    alignment?: "ally" | "enemy";
    characterUrl?: string;
    isNpc?: boolean;
  };
  target?: {
    name: string;
  };
  createdAt: string;
  owner?: {
    name: string;
  };
}

export interface Battle {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
  };
  campaign: {
    _id: string;
    name: string;
  };
  characters: BattleCharacter[];
  active: boolean;
  round: number;
  rounds: BattleRoundEntry[];
  createdAt: string;
  updatedAt: string;
}
