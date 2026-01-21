"use client";

import Pusher from "pusher-js";

import { getBattleById } from "@/lib/actions/battle.actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  UsersIcon,
  SwordsIcon,
  LayersIcon,
  Shield,
  Users,
  Zap,
  History,
  Crown,
  MoreVertical,
  Pencil,
  Settings,
  Swords,
  ScrollText,
  CalendarDays,
  BarChart3,
  Info,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import NewDamage from "./components/newDamage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ChangeRound from "./components/changeRound";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateCharacterStatus } from "@/lib/actions/character.actions";
import { toast } from "sonner";
import { Skull, Heart } from "lucide-react";

// Define type for User object
interface User {
  _id: string;
  name: string;
  email: string;
}

// Define type for Battle object
interface Battle {
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
  characters: Array<{
    _id: string;
    name: string;
    active: boolean;
    status: string;
    alignment?: "ally" | "enemy";
    owner: string;
  }>;
  active: boolean;
  round: number;
  rounds: Array<{
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
    }
  }>;
  createdAt: string;
  updatedAt: string;
}



import { CharacterAvatar } from "@/components/CharacterAvatar";
import { EditBattleModal } from "../components/edit-battle-modal";
import { TurnDetailsModal } from "./components/turn-details-modal";

const BattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<any>(null);
  const [isTurnDetailsModalOpen, setIsTurnDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const battle = await getBattleById(id as string);
        if (battle.ok) {
          setBattle(battle.data);
          const user = await getCurrentUser();
          setCurrentUser(user);
        } else {
          console.error(battle.message);
        }
      } catch (error) {
        console.error("Error fetching battle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`battle-${id}`);

    channel.bind("battle-updated", () => {
      console.log("Received battle update signal, refetching...");
      fetchBattle();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    const handleBattleUpdate = (event: CustomEvent<Battle>) => {
      setBattle(event.detail);
    };

    window.addEventListener(
      "battleUpdated",
      handleBattleUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "battleUpdated",
        handleBattleUpdate as EventListener
      );
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Swords className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-7 w-3/4" />
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ScrollText className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in duration-500">
      <EditBattleModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        battle={battle}
      />
      <TurnDetailsModal
        open={isTurnDetailsModalOpen}
        onOpenChange={setIsTurnDetailsModalOpen}
        turn={selectedTurn}
      />
      {battle && (
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{battle.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">ID:</span> #{battle._id.toString().slice(-4)}
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Created {formatDate(battle.createdAt)}</span>
                </div>
                <Badge variant={battle?.active ? "default" : "secondary"} className="text-[10px] px-2 py-0 h-5">
                  {battle?.active ? "Em andamento" : "Finalizada"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?._id === battle.owner._id && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <div className="border-b">
              <TabsList className="flex h-auto w-full justify-start gap-6 bg-transparent p-0">
                <TabsTrigger
                  value="history"
                  className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
                >
                  Histórico
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
                >
                  Personagens
                </TabsTrigger>
                <TabsTrigger
                  value="statistics"
                  className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
                >
                  Estatísticas
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="history" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-6">
                  {/* Main Feed */}
                  {battle?.rounds && battle.rounds.length > 0 ? (
                    <div className="space-y-4">
                      {battle.rounds.map((round, index) => (
                        <div
                          key={index}
                          className={cn(
                            "relative flex items-center gap-4 p-4 rounded-xl transition-all border group bg-card hover:bg-muted/50",
                            round.description?.startsWith("[TURNO_ALTERADO]")
                              ? "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
                              : round.type === "heal"
                                ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                                : round.isCritical
                                  ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                                  : "border-border/50 hover:border-border"
                          )}
                        >
                          <div className="shrink-0">
                            <Link
                              href={`/dashboard/personagens/${round.character?._id || ""}`}
                              className="cursor-pointer"
                              onClick={(e) => {
                                if (!round.character?._id)
                                  e.preventDefault();
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
                                      : "text-foreground"
                                  )}
                                >
                                  {round.character?.name || "Evento"}
                                </span>

                                {round.target && (
                                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm shrink-0">
                                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate max-w-[100px] sm:max-w-none">{round.target.name}</span>
                                  </div>
                                )}
                              </div>

                              {(round.type === "other" || round.description) && (
                                <div className="text-xs sm:text-sm text-muted-foreground italic min-w-0">
                                  {round.type === "other" && round.description?.startsWith("[TURNO_ALTERADO]") ? (
                                    <span className="text-blue-500 font-medium not-italic flex items-center gap-1">
                                      <History className="h-3 w-3" />
                                      {round.description.replace("[TURNO_ALTERADO] ", "")}
                                    </span>
                                  ) : (
                                    round.description && (
                                      <p className="line-clamp-2 border-l-2 border-primary/20 pl-2">
                                        {round.description}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-center">
                              {round.type !== "other" && (
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
                                          : "text-zinc-100 bg-zinc-600 border-zinc-500"
                                      )}
                                    >
                                      <SwordsIcon className="h-3.5 w-3.5" />
                                      <span className="font-extrabold uppercase">
                                        {round.damage}
                                      </span>
                                      {round.isCritical && (
                                        <span className="text-[10px] uppercase font-bold ml-1 opacity-90">
                                          Crítico
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

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
                                onClick={() => {
                                  setSelectedTurn(round);
                                  setIsTurnDetailsModalOpen(true);
                                }}
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
                      <h3 className="font-semibold text-lg mb-1">Nenhum turno registrado</h3>
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
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Gerenciamento</h3>
                      <div className="flex flex-col gap-3">
                        {battle.active && (
                          <>
                            <NewDamage variant="outline" className="w-full justify-start gap-2 h-9 text-sm" />
                            <div className="flex items-center gap-2">
                              <ChangeRound
                                battleId={battle._id}
                                currentRound={battle.round}
                                advance={true}
                                className="w-full justify-start gap-2 h-9 text-sm inline-flex items-center whitespace-nowrap rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2"
                              />
                            </div>
                          </>
                        )}
                        <Link href={`/dashboard/battles/${battle._id}/manage`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                            <Settings className="h-4 w-4" />
                            Gerenciar Batalha
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mestre</h3>
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
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rodada Atual</h3>
                        <span className="text-2xl font-bold">{battle.round}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dano Aliado</span>
                          <span className="font-medium">
                            {battle?.rounds?.reduce(
                              (acc, round) => acc + (round.type !== "heal" && (!round.character?.alignment || round.character.alignment === "ally") ? round.damage : 0),
                              0
                            ) || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dano Inimigo</span>
                          <span className="font-medium">
                            {battle?.rounds?.reduce(
                              (acc, round) => acc + (round.type !== "heal" && round.character?.alignment === "enemy" ? round.damage : 0),
                              0
                            ) || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cura Total</span>
                          <span className="font-medium text-green-500">
                            {battle?.rounds?.reduce(
                              (acc, round) => acc + (round.type === "heal" ? round.damage : 0),
                              0
                            ) || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              {/* Records Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Recordes da Batalha
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(() => {
                    let maxHit = { value: 0, label: "N/A", sub: "Nenhum" };
                    let maxCharDmgInfo = { value: 0, label: "N/A", sub: "Turno -" };
                    let maxCharHealInfo = { value: 0, label: "N/A", sub: "Turno -" };
                    let maxAllyDmgInfo = { value: 0, sub: "Turno -" };
                    let maxEnemyDmgInfo = { value: 0, sub: "Turno -" };

                    const charTurnDamage: Record<string, Record<number, number>> = {};
                    const charTurnHeal: Record<string, Record<number, number>> = {};
                    const allyTurnDamage: Record<number, number> = {};
                    const enemyTurnDamage: Record<number, number> = {};

                    if (battle?.rounds) {
                      battle.rounds.forEach((round) => {
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

                    const RecordCard = ({ title, value, label, sub, icon: Icon, color }: any) => (
                      <Card className="bg-card/50 border-muted-foreground/10 overflow-hidden relative">
                        <div className={cn("absolute right-2 top-2 opacity-10", color)}>
                          <Icon className="h-12 w-12" />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1" title={title}>
                            {title}
                          </p>
                          <div className="space-y-0.5">
                            <span className={cn("text-2xl font-bold block", color)}>
                              {value}
                            </span>
                            {label && (
                              <p className="text-sm font-medium leading-none truncate" title={label}>
                                {label}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">{sub}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );

                    return (
                      <>
                        <RecordCard
                          title="Maior Golpe"
                          value={maxHit.value}
                          label={maxHit.label}
                          sub={maxHit.sub}
                          icon={Swords}
                          color="text-amber-500"
                        />
                        <RecordCard
                          title="Melhor Turno (Personagem)"
                          value={maxCharDmgInfo.value}
                          label={maxCharDmgInfo.label}
                          sub={maxCharDmgInfo.sub}
                          icon={Zap}
                          color="text-blue-500"
                        />
                        <RecordCard
                          title="Maior Cura (Turno)"
                          value={maxCharHealInfo.value}
                          label={maxCharHealInfo.label}
                          sub={maxCharHealInfo.sub}
                          icon={Heart}
                          color="text-green-500"
                        />
                        <RecordCard
                          title="Turno Mais Forte (Aliados)"
                          value={maxAllyDmgInfo.value}
                          sub={maxAllyDmgInfo.sub}
                          icon={Shield}
                          color="text-indigo-500"
                        />
                        <RecordCard
                          title="Turno Mais Forte (Inimigos)"
                          value={maxEnemyDmgInfo.value}
                          sub={maxEnemyDmgInfo.sub}
                          icon={Skull}
                          color="text-red-500"
                        />
                      </>
                    );
                  })()}
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
                    {(() => {
                      const stats: Record<string, { total: number; maxTurn: number; maxTurnVal: number }> = {};

                      // First pass: Calculate totals and per-turn sums
                      const roundsByCharAndTurn: Record<string, Record<number, number>> = {};

                      battle.rounds.forEach(round => {
                        if (round.type === 'heal' || round.type === 'other' || !round.character?.name) return;

                        const charName = round.character.name;
                        if (!stats[charName]) {
                          stats[charName] = { total: 0, maxTurn: 0, maxTurnVal: 0 };
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
                        .map(([name, stat], index) => (
                          <div key={name} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-muted-foreground w-6 text-center">#{index + 1}</span>
                              <div>
                                <p className="font-medium">{name}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                  <p className="text-[10px] text-muted-foreground">Maior: <span className="font-semibold text-foreground">{stat.maxTurn}</span></p>
                                  <p className="text-[10px] text-muted-foreground">Média: <span className="font-semibold text-foreground">
                                    {(stat.total / Object.keys(roundsByCharAndTurn[name]).length).toFixed(1)}
                                  </span></p>
                                  <p className="text-[10px] text-muted-foreground">Ações: <span className="font-semibold text-foreground">{Object.keys(roundsByCharAndTurn[name]).length}</span></p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{stat.total}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                            </div>
                          </div>
                        ));
                    })()}
                    {battle.rounds.filter(r => r.type !== 'heal' && r.type !== 'other').length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                        <Swords className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">Nenhum dano registrado.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Healing Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-500" />
                    Estatísticas de Cura
                  </h3>
                  <div className="space-y-4">
                    {(() => {
                      const healStats: Record<string, number> = {};
                      battle.rounds.forEach(round => {
                        if (round.type !== 'heal' || !round.character?.name) return;
                        healStats[round.character.name] = (healStats[round.character.name] || 0) + round.damage;
                      });

                      const sortedHealers = Object.entries(healStats).sort((a, b) => b[1] - a[1]);

                      if (sortedHealers.length === 0) return (
                        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                          <Heart className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">Nenhuma cura registrada.</p>
                        </div>
                      );

                      return sortedHealers.map(([name, total], index) => (
                        <div key={name} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-muted-foreground w-6 text-center">#{index + 1}</span>
                            <p className="font-medium">{name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-500">{total}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Healed</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>


            <TabsContent value="characters" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Aliados
                  </h3>
                  <div className="space-y-3">
                    {battle.characters
                      .filter(
                        (char) =>
                          !char.alignment || char.alignment === "ally"
                      )
                      .map((char) => (
                        <div
                          key={char._id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card/50 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={cn(
                                  "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                                  char.status === "dead"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                )}
                              />
                              <CharacterAvatar
                                src={char.characterUrl}
                                isNpc={char.isNpc}
                                className={cn("h-10 w-10", char.status === 'dead' && "grayscale opacity-70")}
                              />
                            </div>
                            <span
                              className={cn(
                                "font-medium",
                                char.status === "dead" &&
                                "line-through text-muted-foreground"
                              )}
                            >
                              {char.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              // Double check if user has permission
                              if (
                                currentUser?._id !== battle.owner._id &&
                                currentUser?._id !== char.owner
                              ) {
                                toast.error(
                                  "Você não tem permissão para alterar o status deste personagem"
                                );
                                return;
                              }

                              const newStatus =
                                char.status === "alive" ? "dead" : "alive";
                              const result = await updateCharacterStatus(
                                char._id,
                                newStatus
                              );
                              if (result.ok) {
                                toast.success(
                                  `Status de ${char.name
                                  } atualizado para ${newStatus === "alive" ? "Vivo" : "Morto"
                                  }`
                                );
                                setBattle((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      characters: prev.characters.map(
                                        (c) =>
                                          c._id === char._id
                                            ? { ...c, status: newStatus }
                                            : c
                                      ),
                                    }
                                    : null
                                );
                              } else {
                                toast.error("Erro ao atualizar status");
                              }
                            }}
                            disabled={
                              currentUser?._id !== battle.owner._id &&
                              currentUser?._id !== char.owner
                            }
                            className="hover:bg-background"
                          >
                            {char.status === "alive" ? (
                              <Skull className="h-4 w-4 text-red-500" />
                            ) : (
                              <Heart className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      ))}
                    {battle.characters.filter(
                      (char) => !char.alignment || char.alignment === "ally"
                    ).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                          <Shield className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">Nenhum aliado.</p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Enemies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Swords className="h-5 w-5 text-red-500" />
                    Inimigos
                  </h3>
                  <div className="space-y-3">
                    {battle.characters
                      .filter((char) => char.alignment === "enemy")
                      .map((char) => (
                        <div
                          key={char._id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card/50 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={cn(
                                  "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                                  char.status === "dead"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                )}
                              />
                              <CharacterAvatar
                                src={char.characterUrl}
                                isNpc={char.isNpc}
                                className={cn("h-10 w-10", char.status === 'dead' && "grayscale opacity-70")}
                              />
                            </div>
                            <span
                              className={cn(
                                "font-medium",
                                char.status === "dead" &&
                                "line-through text-muted-foreground"
                              )}
                            >
                              {char.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (
                                currentUser?._id !== battle.owner._id &&
                                currentUser?._id !== char.owner
                              ) {
                                toast.error(
                                  "Você não tem permissão para alterar o status deste personagem"
                                );
                                return;
                              }
                              const newStatus =
                                char.status === "alive" ? "dead" : "alive";
                              const result = await updateCharacterStatus(
                                char._id,
                                newStatus
                              );
                              if (result.ok) {
                                toast.success(
                                  `Status de ${char.name
                                  } atualizado para ${newStatus === "alive" ? "Vivo" : "Morto"
                                  }`
                                );
                                setBattle((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      characters: prev.characters.map(
                                        (c) =>
                                          c._id === char._id
                                            ? { ...c, status: newStatus }
                                            : c
                                      ),
                                    }
                                    : null
                                );
                              } else {
                                toast.error("Erro ao atualizar status");
                              }
                            }}
                            disabled={
                              currentUser?._id !== battle.owner._id &&
                              currentUser?._id !== char.owner
                            }
                            className="hover:bg-background"
                          >
                            {char.status === "alive" ? (
                              <Skull className="h-4 w-4 text-red-500" />
                            ) : (
                              <Heart className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      ))}
                    {battle.characters.filter(
                      (char) => char.alignment === "enemy"
                    ).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                          <Swords className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">Nenhum inimigo.</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex flex-col sm:flex-row justify-between border-t border-border/50 pt-6 px-2 sm:px-4 gap-2 mt-8">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Criado: {formatDate(battle.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Atualizado: {formatDate(battle.updatedAt)}</span>
            </div>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default BattlePage;
