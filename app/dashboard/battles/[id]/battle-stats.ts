export interface BattleRound {
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
}

export interface BattleRecords {
  maxHit: { value: number; label: string; sub: string };
  maxCharDmgInfo: { value: number; label: string; sub: string };
  maxCharHealInfo: { value: number; label: string; sub: string };
  maxAllyDmgInfo: { value: number; sub: string };
  maxEnemyDmgInfo: { value: number; sub: string };
}

export interface DamageStat {
  name: string;
  total: number;
  maxTurn: number;
  average: number;
  actions: number;
}

export interface HealingStat {
  name: string;
  total: number;
}

export function calculateBattleRecords(rounds: BattleRound[]): BattleRecords {
  let maxHit = { value: 0, label: "N/A", sub: "Nenhum" };
  let maxCharDmgInfo = { value: 0, label: "N/A", sub: "Turno -" };
  let maxCharHealInfo = { value: 0, label: "N/A", sub: "Turno -" };
  let maxAllyDmgInfo = { value: 0, sub: "Turno -" };
  let maxEnemyDmgInfo = { value: 0, sub: "Turno -" };

  const charTurnDamage: Record<string, Record<number, number>> = {};
  const charTurnHeal: Record<string, Record<number, number>> = {};
  const allyTurnDamage: Record<number, number> = {};
  const enemyTurnDamage: Record<number, number> = {};

  if (rounds) {
    rounds.forEach((round) => {
      if (round.type === "other") return;
      const damage = round.damage || 0;
      const charName = round.character?.name || "Desconhecido";
      const roundNum = round.round;

      // 1. Max Hit
      if (round.type !== "heal" && damage > maxHit.value) {
        maxHit = {
          value: damage,
          label: charName,
          sub: `Turno ${roundNum}`,
        };
      }

      // Collect aggregates
      if (round.type === "heal") {
        if (!charTurnHeal[charName]) charTurnHeal[charName] = {};
        charTurnHeal[charName][roundNum] = (charTurnHeal[charName][roundNum] || 0) + damage;
      } else {
        if (!charTurnDamage[charName]) charTurnDamage[charName] = {};
        charTurnDamage[charName][roundNum] = (charTurnDamage[charName][roundNum] || 0) + damage;

        const align = round.character?.alignment;
        if (!align || align === "ally") {
          allyTurnDamage[roundNum] = (allyTurnDamage[roundNum] || 0) + damage;
        } else if (align === "enemy") {
          enemyTurnDamage[roundNum] = (enemyTurnDamage[roundNum] || 0) + damage;
        }
      }
    });

    // Process Max Char Turn Damage
    let charMaxVal = 0;
    Object.entries(charTurnDamage).forEach(([name, turns]) => {
      Object.entries(turns).forEach(([turn, val]) => {
        if (val > charMaxVal) {
          charMaxVal = val;
          maxCharDmgInfo = { value: val, label: name, sub: `Turno ${turn}` };
        }
      });
    });

    // Process Max Char Turn Heal
    let healMaxVal = 0;
    Object.entries(charTurnHeal).forEach(([name, turns]) => {
      Object.entries(turns).forEach(([turn, val]) => {
        if (val > healMaxVal) {
          healMaxVal = val;
          maxCharHealInfo = { value: val, label: name, sub: `Turno ${turn}` };
        }
      });
    });

    // Process Max Ally Turn Damage
    let allyMaxVal = 0;
    Object.entries(allyTurnDamage).forEach(([turn, val]) => {
      if (val > allyMaxVal) {
        allyMaxVal = val;
        maxAllyDmgInfo = { value: val, sub: `Turno ${turn}` };
      }
    });

    // Process Max Enemy Turn Damage
    let enemyMaxVal = 0;
    Object.entries(enemyTurnDamage).forEach(([turn, val]) => {
      if (val > enemyMaxVal) {
        enemyMaxVal = val;
        maxEnemyDmgInfo = { value: val, sub: `Turno ${turn}` };
      }
    });
  }

  return {
    maxHit,
    maxCharDmgInfo,
    maxCharHealInfo,
    maxAllyDmgInfo,
    maxEnemyDmgInfo,
  };
}

export function calculateDamageStats(rounds: BattleRound[]): DamageStat[] {
  const stats: Record<string, { total: number; maxTurn: number }> = {};
  const roundsByCharAndTurn: Record<string, Record<number, number>> = {};

  rounds.forEach(round => {
    if (round.type === 'heal' || round.type === 'other' || !round.character?.name) return;

    const charName = round.character.name;
    if (!stats[charName]) {
      stats[charName] = { total: 0, maxTurn: 0 };
    }
    stats[charName].total += round.damage;

    if (!roundsByCharAndTurn[charName]) roundsByCharAndTurn[charName] = {};
    roundsByCharAndTurn[charName][round.round] = (roundsByCharAndTurn[charName][round.round] || 0) + round.damage;
  });

  // Second pass: Calculate max turn damage
  Object.entries(roundsByCharAndTurn).forEach(([name, turns]) => {
    if (stats[name]) {
      const maxVal = Math.max(...Object.values(turns));
      stats[name].maxTurn = maxVal;
    }
  });

  return Object.entries(stats)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      maxTurn: stat.maxTurn,
      average: stat.total / Object.keys(roundsByCharAndTurn[name]).length,
      actions: Object.keys(roundsByCharAndTurn[name]).length
    }));
}

export function calculateHealingStats(rounds: BattleRound[]): HealingStat[] {
  const healStats: Record<string, number> = {};
  rounds.forEach(round => {
    if (round.type !== 'heal' || !round.character?.name) return;
    healStats[round.character.name] = (healStats[round.character.name] || 0) + round.damage;
  });

  return Object.entries(healStats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => ({ name, total }));
}
