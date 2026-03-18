"use client";

import { getBattleById } from "@/lib/actions/battle.actions";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  Pencil,
  Swords,
  ScrollText,
  CalendarDays,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { EditBattleModal } from "../components/edit-battle-modal";
import { TurnDetailsModal } from "./components/turn-details-modal";
import { BattleHistory } from "./components/battle-history";
import { BattleStatistics } from "./components/battle-statistics";
import { BattleCharacters } from "./components/battle-characters";
import {
  calculateBattleRecords,
  calculateDamageStats,
  calculateHealingStats,
} from "./battle-stats";
import type { Battle, User } from "./types";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<any>(null);
  const [isTurnDetailsModalOpen, setIsTurnDetailsModalOpen] = useState(false);

  // rerender-memo: memoized computations skip when rounds haven't changed
  const battleRecords = useMemo(() => {
    return calculateBattleRecords(battle?.rounds || []);
  }, [battle?.rounds]);

  const damageStats = useMemo(() => {
    return calculateDamageStats(battle?.rounds || []);
  }, [battle?.rounds]);

  const healingStats = useMemo(() => {
    return calculateHealingStats(battle?.rounds || []);
  }, [battle?.rounds]);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        // async-parallel: independent fetches run concurrently
        const [battleResult, user] = await Promise.all([
          getBattleById(id as string),
          getCurrentUser(),
        ]);

        if (battleResult.ok) {
          setBattle(battleResult.data);
          setCurrentUser(user);
        } else {
          console.error(battleResult.message);
        }
      } catch (error) {
        console.error("Error fetching battle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();

    // bundle-dynamic-imports: Pusher (~50KB) loaded only when needed
    let channel: any;
    let pusherInstance: any;

    const setupPusher = async () => {
      const Pusher = (await import("pusher-js")).default;
      pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      channel = pusherInstance.subscribe(`battle-${id}`);
      channel.bind("battle-updated", () => {
        console.log("Received battle update signal, refetching...");
        fetchBattle();
      });
    };

    setupPusher();

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
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

  // useCallback: stable reference for child component handlers
  const handleOpenTurnDetails = useCallback((turn: any) => {
    setSelectedTurn(turn);
    setIsTurnDetailsModalOpen(true);
  }, []);

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
        currentUser={currentUser}
        battle={battle}
      />
      {battle ? (
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {battle.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">ID:</span> #
                  {battle._id.toString().slice(-4)}
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Created {formatDate(battle.createdAt)}</span>
                </div>
                <Badge
                  variant={battle.active ? "default" : "secondary"}
                  className="text-[10px] px-2 py-0 h-5"
                >
                  {battle.active ? "Em andamento" : "Finalizada"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?._id === battle.owner._id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsEditModalOpen(true)}
                        aria-label="Editar batalha"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar batalha</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
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

            <TabsContent
              value="history"
              className="space-y-8 animate-in slide-in-from-bottom-2 duration-500"
            >
              <BattleHistory
                battle={battle}
                currentUser={currentUser}
                onOpenTurnDetails={handleOpenTurnDetails}
              />
            </TabsContent>

            <TabsContent
              value="statistics"
              className="space-y-6 animate-in slide-in-from-bottom-2 duration-500"
            >
              <BattleStatistics
                battleRecords={battleRecords}
                damageStats={damageStats}
                healingStats={healingStats}
              />
            </TabsContent>

            <TabsContent
              value="characters"
              className="space-y-6 animate-in slide-in-from-bottom-2 duration-500"
            >
              <BattleCharacters
                battle={battle}
                currentUser={currentUser}
                onBattleUpdate={setBattle}
              />
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
      ) : null}
    </div>
  );
};

export default BattlePage;
