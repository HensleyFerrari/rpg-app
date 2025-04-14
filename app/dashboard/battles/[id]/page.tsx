"use client";

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
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import NewDamage from "./components/newDamage";
import AddCharacterModal from "./components/addCharacter";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ChangeRound from "./components/changeRound";
import { Button } from "@/components/ui/button";

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

    // Adicionar listener para atualização da batalha
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
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mt-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
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

            {/* Battle Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    <Users className="h-6 w-6 mx-auto text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Personagens Ativos
                    </h3>
                    <div className="text-2xl font-bold">
                      {battle?.characters?.filter((char) => char).length || 0}/
                      {battle?.characters?.length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Crown className="h-6 w-6 mx-auto text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Maior Dano
                    </h3>
                    <div className="text-2xl font-bold">
                      {Math.max(
                        ...(battle?.rounds?.map(
                          (round) => round.damage || 0
                        ) || [0])
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {battle?.active && (
              <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:gap-6">
                <div className="flex-1">
                  {battle.characters.some((char) => char) && <NewDamage />}
                </div>
                {currentUser?._id === battle?.owner?._id && (
                  <div className="flex-1">
                    <AddCharacterModal />
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
                        <span className="truncate flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          {round.character.name}
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
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Nenhum turno registrado ainda.
                </p>
              )}
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
