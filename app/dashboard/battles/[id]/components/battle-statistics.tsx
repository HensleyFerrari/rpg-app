import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/utils/utils";
import { Crown, Zap, Shield, Swords, Heart } from "lucide-react";
import { Skull } from "lucide-react";
import type { BattleRecords, DamageStat, HealingStat } from "../battle-stats";

// RecordCard hoisted outside – static structure, no need to recreate
const RecordCard = ({
  title,
  value,
  label,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  label?: string;
  sub: string;
  icon: any;
  color: string;
}) => (
  <Card className="bg-card/50 border-muted-foreground/10 overflow-hidden relative">
    <div className={cn("absolute right-2 top-2 opacity-10", color)}>
      <Icon className="h-12 w-12" />
    </div>
    <CardContent className="p-4 space-y-2">
      <p
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1"
        title={title}
      >
        {title}
      </p>
      <div className="space-y-0.5">
        <span className={cn("text-2xl font-bold block", color)}>{value}</span>
        {label ? (
          <p
            className="text-sm font-medium leading-none truncate"
            title={label}
          >
            {label}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </CardContent>
  </Card>
);

interface BattleStatisticsProps {
  battleRecords: BattleRecords;
  damageStats: DamageStat[];
  healingStats: HealingStat[];
}

export const BattleStatistics = memo(function BattleStatistics({
  battleRecords,
  damageStats,
  healingStats,
}: BattleStatisticsProps) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Recordes da Batalha
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <RecordCard
            title="Maior Golpe"
            value={battleRecords.maxHit.value}
            label={battleRecords.maxHit.label}
            sub={battleRecords.maxHit.sub}
            icon={Swords}
            color="text-amber-500"
          />
          <RecordCard
            title="Melhor Turno (Personagem)"
            value={battleRecords.maxCharDmgInfo.value}
            label={battleRecords.maxCharDmgInfo.label}
            sub={battleRecords.maxCharDmgInfo.sub}
            icon={Zap}
            color="text-blue-500"
          />
          <RecordCard
            title="Maior Cura (Turno)"
            value={battleRecords.maxCharHealInfo.value}
            label={battleRecords.maxCharHealInfo.label}
            sub={battleRecords.maxCharHealInfo.sub}
            icon={Heart}
            color="text-green-500"
          />
          <RecordCard
            title="Turno Mais Forte (Aliados)"
            value={battleRecords.maxAllyDmgInfo.value}
            sub={battleRecords.maxAllyDmgInfo.sub}
            icon={Shield}
            color="text-indigo-500"
          />
          <RecordCard
            title="Turno Mais Forte (Inimigos)"
            value={battleRecords.maxEnemyDmgInfo.value}
            sub={battleRecords.maxEnemyDmgInfo.sub}
            icon={Skull}
            color="text-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Damage Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Estatísticas de Dano
          </h3>
          <div className="space-y-4">
            {damageStats.map((stat, index) => (
              <div
                key={stat.name}
                className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-muted-foreground w-6 text-center">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{stat.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <p className="text-[10px] text-muted-foreground">
                        Maior:{" "}
                        <span className="font-semibold text-foreground">
                          {stat.maxTurn}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Média:{" "}
                        <span className="font-semibold text-foreground">
                          {stat.average.toFixed(1)}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Ações:{" "}
                        <span className="font-semibold text-foreground">
                          {stat.actions}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{stat.total}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Total
                  </p>
                </div>
              </div>
            ))}
            {damageStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                <Swords className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum dano registrado.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Healing Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-500" />
            Estatísticas de Cura
          </h3>
          <div className="space-y-4">
            {healingStats.length > 0 ? (
              healingStats.map((stat, index) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground w-6 text-center">
                      #{index + 1}
                    </span>
                    <p className="font-medium">{stat.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      {stat.total}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Healed
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                <Heart className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma cura registrada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
