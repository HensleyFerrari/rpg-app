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
import { CalendarIcon, UsersIcon, SwordsIcon, LayersIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { createDamage } from "@/lib/actions/damage.actions";
import NewDamage from "./components/newDamage";
import AddCharacterModal from "./components/addCharacter";

// Define type for Battle object
interface Battle {
  _id: string;
  name: string;
  owner: string;
  campaign: string;
  characters: any[];
  round: number;
  rounds: any[];
  createdAt: string;
  updatedAt: string;
}

const BattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fecthBattle = async () => {
      if (!loading) return;
      const battle = await getBattleById(id);
      if (battle.ok) {
        setLoading(false);
        setBattle(battle.data);

        const user = await getCurrentUser();
        setCurrentUser(user);
      } else {
        console.error(battle.message);
      }
    };

    fecthBattle();
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
      {battle && (
        <Card className="w-full shadow-lg">
          <CardHeader className="px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-xl md:text-3xl font-bold">
                {battle.name}
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                Turno {battle.round}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

            {battle.active && (
              <div className="flex gap-4 mb-4 sm:gap-6">
                <NewDamage />
                {currentUser?._id === battle?.owner?._id && (
                  <AddCharacterModal />
                )}
              </div>
            )}

            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="text-lg font-medium mb-2">Histórico de turnos</h3>
              {battle.rounds && battle.rounds.length > 0 ? (
                <div className="space-y-2">
                  {battle.rounds.map((round, index) => (
                    <div key={index} className="p-2 bg-muted rounded">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium">Turno {round.round}</span>
                        <span className="truncate">{round.character.name}</span>
                        <span className="text-right">
                          {round.isCritical ? (
                            <span className="font-bold">{round.damage}</span>
                          ) : (
                            round.damage
                          )}
                          {round.isCritical && (
                            <span className="text-xs ml-1 text-amber-500">
                              (Crítico)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
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
