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
  Target,
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
  MessageSquare,
  BarChart3,
  Info,
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
import { Breadcrumb } from "@/components/ui/breadcrumb";

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
      name: string;
      alignment?: "ally" | "enemy";
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
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Batalhas", href: "/dashboard/battles" },
          { label: battle?.name || "Detalhes da Batalha" },
        ]}
      />
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
        <Card className="w-full shadow-lg">
          <CardHeader className="px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-xl md:text-3xl font-bold">
                {battle.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={battle?.active ? "default" : "secondary"}>
                  {battle?.active ? "Em andamento" : "Finalizada"}
                </Badge>
                {currentUser?._id === battle?.owner?._id && battle?.active && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Opções da batalha</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5">
                        <ChangeRound
                          battleId={battle._id}
                          currentRound={battle.round}
                          advance={true}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <ChangeRound
                          battleId={battle._id}
                          currentRound={battle.round}
                          advance={false}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-1 py-1">
                        <DropdownMenuItem
                          onClick={() => {
                            // Delay opening to allow dropdown to close cleanly first
                            setTimeout(() => setIsEditModalOpen(true), 50);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 5">
                        <Link
                          href={`/dashboard/battles/${battle._id}/manage`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Gerenciar Batalha
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            <Tabs defaultValue="history" className="w-full">
              <div className="mb-6">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2 py-2 sm:py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Histórico</span>
                    <span className="sm:hidden">Turnos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="statistics"
                    className="flex items-center gap-2 py-2 sm:py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Estatísticas</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="characters"
                    className="flex items-center gap-2 py-2 sm:py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Personagens</span>
                    <span className="sm:hidden">Pers.</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="history" className="space-y-6">
                {/* Battle Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Sidebar - Stats & Info (1 col) */}
                  <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                    {/* Status & Round */}
                    <Card className="bg-card shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <Badge variant={battle?.active ? "default" : "secondary"} className="text-[10px] px-2 py-0 h-5">
                            {battle?.active ? "Ativo" : "Finalizado"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Rodada</span>
                          <span className="text-2xl font-bold">{battle?.round || 0}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 gap-3">
                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Zap className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Dano Aliado</p>
                              <p className="text-lg font-bold leading-tight">
                                {battle?.rounds?.reduce(
                                  (acc, round) => acc + (round.type !== "heal" && (!round.character?.alignment || round.character.alignment === "ally") ? round.damage : 0),
                                  0
                                ) || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                              <Zap className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Dano Inimigo</p>
                              <p className="text-lg font-bold leading-tight">
                                {battle?.rounds?.reduce(
                                  (acc, round) => acc + (round.type !== "heal" && round.character?.alignment === "enemy" ? round.damage : 0),
                                  0
                                ) || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <Swords className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Maior Dano (Turno)</p>
                              <p className="text-lg font-bold leading-tight">
                                {(() => {
                                  const damageRounds = battle?.rounds?.filter((r) => r.type !== "heal") || [];
                                  if (damageRounds.length === 0) return 0;

                                  const damagePerRound = damageRounds.reduce((acc, round) => {
                                    acc[round.round] = (acc[round.round] || 0) + round.damage;
                                    return acc;
                                  }, {} as Record<number, number>);

                                  return Math.max(...Object.values(damagePerRound));
                                })()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card> */}

                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                              <Heart className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Cura Total</p>
                              <p className="text-lg font-bold leading-tight text-green-500">
                                {battle?.rounds?.reduce(
                                  (acc, round) => acc + (round.type === "heal" ? round.damage : 0),
                                  0
                                ) || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Crown className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Maior Golpe</p>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <p className="text-lg font-bold leading-tight">
                                  {(() => {
                                    const damageRounds = battle?.rounds?.filter((r) => r.type !== "heal") || [];
                                    return damageRounds.length > 0 ? Math.max(...damageRounds.map((r) => r.damage)) : 0;
                                  })()}
                                </p>
                                {battle?.rounds?.filter((r) => r.type !== "heal").length > 0 && (
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                    ({
                                      battle.rounds
                                        .filter((r) => r.type !== "heal" && r.character)
                                        .reduce((max, round) => (round.damage || 0) > (max.damage || 0) ? round : max)
                                        .character?.name || "N/A"
                                    })
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Swords className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Média Aliada</p>
                              <p className="text-lg font-bold leading-tight">
                                {(() => {
                                  const allyRounds = battle?.rounds?.filter((r) =>
                                    r.type !== "heal" &&
                                    r.character &&
                                    (!r.character.alignment || r.character.alignment === "ally")
                                  ) || [];
                                  const totalDamage = allyRounds.reduce((acc, r) => acc + (r.damage || 0), 0);
                                  return allyRounds.length > 0 ? (totalDamage / allyRounds.length).toFixed(1) : 0;
                                })()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/50 shadow-sm border-none">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                              <Swords className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Média Inimiga</p>
                              <p className="text-lg font-bold leading-tight">
                                {(() => {
                                  const enemyRounds = battle?.rounds?.filter((r) =>
                                    r.type !== "heal" &&
                                    r.character?.alignment === "enemy"
                                  ) || [];
                                  const totalDamage = enemyRounds.reduce((acc, r) => acc + (r.damage || 0), 0);
                                  return enemyRounds.length > 0 ? (totalDamage / enemyRounds.length).toFixed(1) : 0;
                                })()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Battle Metadata */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <UsersIcon className="h-4 w-4 opacity-50" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Mestre</p>
                          <p className="text-xs font-medium truncate">{battle.owner.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <LayersIcon className="h-4 w-4 opacity-50" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Campanha</p>
                          <p className="text-xs font-medium truncate">{battle.campaign.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main content (3 cols) */}
                  <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                    {battle?.active && (
                      <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Pronto para ação?</h3>
                            <p className="text-sm text-muted-foreground">Registre os danos e curas do próximo turno.</p>
                          </div>
                          {battle.characters.some((char) => char) && <NewDamage />}
                        </CardContent>
                      </Card>
                    )}
                    <div className="border rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Histórico de turnos</h3>
                      </div>
                      {battle?.rounds && battle.rounds.length > 0 ? (
                        <div className="space-y-2">
                          {battle.rounds.map((round, index) => (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg hover:bg-muted/80 transition-colors",
                                round.description?.startsWith("[TURNO_ALTERADO]")
                                  ? "bg-blue-500/10 border border-blue-500/20"
                                  : "bg-muted"
                              )}
                            >
                              <div className="grid grid-cols-3 gap-4 text-sm items-center min-w-0">
                                <span className="font-medium flex items-center gap-2 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                                    onClick={() => {
                                      setSelectedTurn(round);
                                      setIsTurnDetailsModalOpen(true);
                                    }}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="shrink-0">Turno {round.round}</span>
                                </span>
                                {round.type === "other" ? (
                                  <span className={cn(
                                    "col-span-2 flex items-start gap-2 break-all whitespace-pre-wrap min-w-0",
                                    round.description?.startsWith("[TURNO_ALTERADO]")
                                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                                      : "italic text-muted-foreground"
                                  )}>
                                    {round.description?.startsWith("[TURNO_ALTERADO]") ? (
                                      <History className="h-4 w-4 shrink-0 mt-0.5" />
                                    ) : (
                                      <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                                    )}
                                    <span className="flex-1 min-w-0">
                                      {round.description?.replace("[TURNO_ALTERADO] ", "").replace("[TURNO_ALTERADO]", "")}
                                    </span>
                                  </span>
                                ) : (
                                  <>
                                    <span
                                      className={cn(
                                        "truncate flex items-center gap-2",
                                        round.character?.alignment === "enemy" &&
                                        "text-red-500"
                                      )}
                                    >
                                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                      {round.character?.name || "Evento"}
                                      {round.target && (
                                        <>
                                          <span className="text-muted-foreground">
                                            ➔
                                          </span>
                                          {round.target.name}
                                        </>
                                      )}
                                    </span>
                                    <span className="text-right flex items-center justify-end gap-2">
                                      {round.type === "heal" ? (
                                        <Heart className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <SwordsIcon className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      {round.isCritical ? (
                                        <span
                                          className={cn(
                                            "font-bold",
                                            round.type === "heal"
                                              ? "text-green-500"
                                              : "text-amber-500"
                                          )}
                                        >
                                          {round.damage}
                                        </span>
                                      ) : (
                                        <span
                                          className={cn(
                                            round.type === "heal" && "text-green-500"
                                          )}
                                        >
                                          {round.damage}
                                        </span>
                                      )}
                                      {round.isCritical && (
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-xs ml-1",
                                            round.type === "heal"
                                              ? "text-green-500 border-green-500"
                                              : "text-amber-500 border-amber-500"
                                          )}
                                        >
                                          Crítico
                                        </Badge>
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border rounded-lg bg-muted/20">
                          <p className="text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <History className="h-8 w-8 opacity-50" />
                            Nenhum turno registrado ainda.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Damage Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Swords className="h-5 w-5" />
                        Estatísticas de Dano
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                          <p className="text-muted-foreground text-center py-4">Nenhum dano registrado.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Healing Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-green-500" />
                        Estatísticas de Cura
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const stats: Record<string, { total: number; maxTurn: number }> = {};

                          // First pass: Calculate totals and per-turn sums
                          const roundsByCharAndTurn: Record<string, Record<number, number>> = {};

                          battle.rounds.forEach(round => {
                            if (round.type !== 'heal' || !round.character?.name) return;

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
                                  <p className="text-lg font-bold text-green-500">{stat.total}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                                </div>
                              </div>
                            ));
                        })()}
                        {battle.rounds.filter(r => r.type === 'heal').length === 0 && (
                          <p className="text-muted-foreground text-center py-4">Nenhuma cura registrada.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>


              <TabsContent value="characters">
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
                            className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  char.status === "dead"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                )}
                              />
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
                          <p className="text-sm text-muted-foreground">
                            Nenhum aliado.
                          </p>
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
                            className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  char.status === "dead"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                )}
                              />
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
                          <p className="text-sm text-muted-foreground">
                            Nenhum inimigo.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-4 px-3 sm:px-6 gap-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>Criado: {formatDate(battle.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>Atualizado: {formatDate(battle.updatedAt)}</span>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default BattlePage;
