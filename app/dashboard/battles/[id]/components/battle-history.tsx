import { memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SwordsIcon,
  History,
  Crown,
  Settings,
  Info,
  ArrowRight,
} from "lucide-react";
import { Heart } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import NewDamage from "./newDamage";
import ChangeRound from "./changeRound";
import type { Battle, User } from "../types";

interface BattleHistoryProps {
  battle: Battle;
  currentUser: User | null;
  onOpenTurnDetails: (turn: any) => void;
}

export const BattleHistory = memo(function BattleHistory({
  battle,
  currentUser,
  onOpenTurnDetails,
}: BattleHistoryProps) {
  const allyDamage =
    battle.rounds?.reduce(
      (acc, round) =>
        acc +
        (round.type !== "heal" &&
        (!round.character?.alignment || round.character.alignment === "ally")
          ? round.damage
          : 0),
      0,
    ) ?? 0;

  const enemyDamage =
    battle.rounds?.reduce(
      (acc, round) =>
        acc +
        (round.type !== "heal" && round.character?.alignment === "enemy"
          ? round.damage
          : 0),
      0,
    ) ?? 0;

  const totalHeal =
    battle.rounds?.reduce(
      (acc, round) => acc + (round.type === "heal" ? round.damage : 0),
      0,
    ) ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="md:col-span-2 space-y-6">
        {/* Main Feed */}
        {battle.rounds && battle.rounds.length > 0 ? (
          <div className="space-y-4">
            {battle.rounds.map((round, index) => (
              <div
                key={round._id || index}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl transition-all border group bg-card hover:bg-muted/50",
                  round.description?.startsWith("[TURNO_ALTERADO]")
                    ? "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
                    : round.type === "heal"
                      ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                      : round.isCritical
                        ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                        : "border-border/50 hover:border-border",
                )}
              >
                <div className="shrink-0">
                  <Link
                    href={`/dashboard/personagens/${round.character?._id || ""}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      if (!round.character?._id) e.preventDefault();
                    }}
                  >
                    <CharacterAvatar
                      src={round.character?.characterUrl}
                      isNpc={round.character?.isNpc}
                      className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-sm"
                    />
                  </Link>
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={cn(
                          "font-semibold text-sm sm:text-base truncate",
                          round.character?.alignment === "enemy"
                            ? "text-red-500"
                            : "text-foreground",
                        )}
                      >
                        {round.character?.name || "Evento"}
                      </span>

                      {round.target ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm shrink-0">
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate max-w-[100px] sm:max-w-none">
                            {round.target.name}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {round.type === "other" || round.description ? (
                      <div className="text-xs sm:text-sm text-muted-foreground italic min-w-0">
                        {round.type === "other" &&
                        round.description?.startsWith("[TURNO_ALTERADO]") ? (
                          <span className="text-blue-500 font-medium not-italic flex items-center gap-1">
                            <History className="h-3 w-3" />
                            {round.description.replace("[TURNO_ALTERADO] ", "")}
                          </span>
                        ) : round.description ? (
                          <p className="line-clamp-2 border-l-2 border-primary/20 pl-2">
                            {round.description}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {round.type !== "other" ? (
                      <>
                        {round.type === "heal" ? (
                          <div className="flex items-center gap-1.5 text-green-100 bg-green-600 px-3 py-1 rounded-full text-sm shadow-sm border border-green-500">
                            <Heart className="h-3.5 w-3.5 fill-current" />
                            <span className="font-extrabold uppercase">
                              {round.damage}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm shadow-sm border",
                              round.isCritical
                                ? "text-amber-100 bg-amber-600 border-amber-500"
                                : "text-zinc-100 bg-zinc-600 border-zinc-500",
                            )}
                          >
                            <SwordsIcon className="h-3.5 w-3.5" />
                            <span className="font-extrabold uppercase">
                              {round.damage}
                            </span>
                            {round.isCritical ? (
                              <span className="text-[10px] uppercase font-bold ml-1 opacity-90">
                                Crítico
                              </span>
                            ) : null}
                          </div>
                        )}
                      </>
                    ) : null}

                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 font-medium text-muted-foreground bg-muted/50 whitespace-nowrap"
                    >
                      Turno {round.round}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      aria-label="Ver detalhes do turno"
                      onClick={() => onOpenTurnDetails(round)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-xl bg-muted/20 border-dashed">
            <History className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-1">
              Nenhum turno registrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Comece o combate registrando danos ou curas.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Gerenciamento
            </h3>
            <div className="flex flex-col gap-3">
              {battle.active ? (
                <>
                  <NewDamage
                    variant="outline"
                    className="w-full justify-start gap-2 h-9 text-sm"
                  />
                  {currentUser?._id === battle.owner._id ? (
                    <div className="flex items-center gap-2">
                      <ChangeRound
                        battleId={battle._id}
                        currentRound={battle.round}
                        advance={true}
                        className="w-full justify-start gap-2 h-9 text-sm inline-flex items-center whitespace-nowrap rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
              {currentUser?._id === battle.owner._id ? (
                <Link
                  href={`/dashboard/battles/${battle._id}/manage`}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-9 text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    Gerenciar Batalha
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Mestre
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {battle.owner?.name || "Mestre"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Rodada Atual
              </h3>
              <span className="text-2xl font-bold">{battle.round}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dano Aliado</span>
                <span className="font-medium">{allyDamage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dano Inimigo</span>
                <span className="font-medium">{enemyDamage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cura Total</span>
                <span className="font-medium text-green-500">{totalHeal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
