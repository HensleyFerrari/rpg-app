import { calculateBattleRecords, calculateDamageStats, calculateHealingStats, BattleRound } from '../app/dashboard/battles/[id]/battle-stats';

// Mock data generator
function generateRounds(count: number): BattleRound[] {
    const rounds: BattleRound[] = [];
    const characters = [
        { _id: 'c1', name: 'Hero', alignment: 'ally' as const },
        { _id: 'c2', name: 'Mage', alignment: 'ally' as const },
        { _id: 'c3', name: 'Cleric', alignment: 'ally' as const },
        { _id: 'e1', name: 'Goblin', alignment: 'enemy' as const },
        { _id: 'e2', name: 'Orc', alignment: 'enemy' as const },
        { _id: 'e3', name: 'Dragon', alignment: 'enemy' as const },
    ];

    for (let i = 0; i < count; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const type = Math.random() > 0.8 ? 'heal' : 'damage';

        rounds.push({
            _id: `r${i}`,
            damage: Math.floor(Math.random() * 50) + 1,
            type: type as 'damage' | 'heal',
            round: Math.floor(i / 10) + 1,
            isCritical: Math.random() > 0.9,
            character: char,
            // @ts-ignore
            createdAt: new Date().toISOString(),
        });
    }
    return rounds;
}

const ROUND_COUNTS = [100, 1000, 10000, 50000];

console.log('Running Battle Stats Benchmark...');
console.log('---------------------------------');

for (const count of ROUND_COUNTS) {
    const rounds = generateRounds(count);

    console.log(`\nScenario: ${count} rounds`);

    const start = performance.now();
    calculateBattleRecords(rounds);
    calculateDamageStats(rounds);
    calculateHealingStats(rounds);
    const end = performance.now();

    console.log(`Total execution time: ${(end - start).toFixed(4)} ms`);
    console.log(`Average time per round: ${((end - start) / count).toFixed(6)} ms`);
}
