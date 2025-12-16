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
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import NewDamage from "./components/newDamage";
import {
  DropdownMenu,
  DropdownMenuContent,
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
    round: number;
    isCritical: boolean;
    character: {
      name: string;
      alignment?: "ally" | "enemy";
    };
    target?: {
      name: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}



const BattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  useEffect(() => {
    fetchBattle();

    // Pusher setup
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
    <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Batalhas", href: "/dashboard/battles" },
          { label: battle?.name || "Detalhes da Batalha" },
        ]}
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
                      <div className="px-2 py-1 5">
                        <Link
                          href={`/dashboard/battles/${battle._id}/edit`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
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
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="characters">Personagens</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="history" className="space-y-6">
                {/* Battle Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Shield className="h-6 w-6 mx-auto text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Rodada Atual
                        </h3>
                        <div className="text-2xl font-bold">
                          {battle?.round || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Zap className="h-6 w-6 mx-auto text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Dano Total
                        </h3>
                        <div className="text-2xl font-bold">
                          {battle?.rounds?.reduce(
                            (acc, round) => acc + (round.damage || 0),
                            0
                          ) || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Crown className="h-6 w-6 mx-auto text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Maior Dano <br />
                          {battle?.rounds?.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              (
                              {
                                battle.rounds.reduce((max, round) =>
                                  (round.damage || 0) > (max.damage || 0)
                                    ? round
                                    : max
                                ).character.name
                              }
                              )
                            </span>
                          )}
                        </h3>
                        <div className="text-2xl font-bold">
                          {battle?.rounds?.length > 0
                            ? Math.max(
                                ...(battle?.rounds?.map(
                                  (round) => round.damage || 0
                                ) || [0])
                              )
                            : 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Swords className="h-6 w-6 mx-auto text-blue-500" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Dano Médio (Aliados)
                        </h3>
                        <div className="text-2xl font-bold">
                          {(() => {
                            const allyRounds =
                              battle?.rounds?.filter(
                                (r) =>
                                  !r.character.alignment ||
                                  r.character.alignment === "ally"
                              ) || [];
                            const totalDamage = allyRounds.reduce(
                              (acc, r) => acc + (r.damage || 0),
                              0
                            );
                            return allyRounds.length > 0
                              ? (totalDamage / allyRounds.length).toFixed(1)
                              : 0;
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Swords className="h-6 w-6 mx-auto text-red-500" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Dano Médio (Inimigos)
                        </h3>
                        <div className="text-2xl font-bold">
                          {(() => {
                            const enemyRounds =
                              battle?.rounds?.filter(
                                (r) => r.character.alignment === "enemy"
                              ) || [];
                            const totalDamage = enemyRounds.reduce(
                              (acc, r) => acc + (r.damage || 0),
                              0
                            );
                            return enemyRounds.length > 0
                              ? (totalDamage / enemyRounds.length).toFixed(1)
                              : 0;
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {battle?.active && (
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-1">
                      {battle.characters.some((char) => char) && <NewDamage />}
                    </div>
                    {currentUser?._id === battle?.owner?._id && (
                      <div className="flex-1">
                        {/* AddCharacterModal moved to manage page */}
                      </div>
                    )}
                  </div>
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
                          className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <div className="grid grid-cols-3 gap-4 text-sm items-center">
                            <span className="font-medium flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              Turno {round.round}
                            </span>
                            <span
                              className={cn(
                                "truncate flex items-center gap-2",
                                round.character.alignment === "enemy" &&
                                  "text-red-500"
                              )}
                            >
                              <UsersIcon className="h-4 w-4 text-muted-foreground" />
                              {round.character.name}
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
                              <SwordsIcon className="h-4 w-4 text-muted-foreground" />
                              {round.isCritical ? (
                                <span className="font-bold text-amber-500">
                                  {round.damage}
                                </span>
                              ) : (
                                round.damage
                              )}
                              {round.isCritical && (
                                <Badge
                                  variant="outline"
                                  className="text-xs ml-1 text-amber-500"
                                >
                                  Crítico
                                </Badge>
                              )}
                            </span>
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
                                    `Status de ${
                                      char.name
                                    } atualizado para ${
                                      newStatus === "alive" ? "Vivo" : "Morto"
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
                                    `Status de ${
                                      char.name
                                    } atualizado para ${
                                      newStatus === "alive" ? "Vivo" : "Morto"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Battle Info Cards */}
              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-muted rounded-lg">
                <UsersIcon className="h-5 w-5 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Mestre</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {battle.owner.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-muted rounded-lg">
                <LayersIcon className="h-5 w-5 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Campanha</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {battle.campaign.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-muted rounded-lg">
                <SwordsIcon className="h-5 w-5 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Personagens</p>
                  <p className="text-xs text-muted-foreground">
                    {battle.characters.length || "Sem personagens"}
                  </p>
                </div>
              </div>
            </div>
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
