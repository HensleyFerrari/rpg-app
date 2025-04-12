"use client";

import { useEffect, useState } from "react";
import { getAllBattles } from "@/lib/actions/battle.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
    imageUrl?: string;
  };
  active: boolean;
  round: number;
  createdAt: string;
}

const MyBattlesDashboard = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ _id: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const battlesResponse = await getAllBattles();
        const user = await getCurrentUser();

        if (battlesResponse.ok && user) {
          // Filter battles where the user is the owner
          const userBattles = battlesResponse.data.filter(
            (battle) => battle.owner._id === user._id
          );
          setBattles(userBattles);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching battles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separate battles into active and inactive
  const activeBattles = battles.filter((battle) => battle.active);
  const inactiveBattles = battles.filter((battle) => !battle.active);

  const BattleCard = ({ battle }: { battle: Battle }) => (
    <Card className="shadow hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{battle.name || "Unnamed Battle"}</CardTitle>
            <CardDescription>
              {battle.campaign?.name || "No Campaign"}
            </CardDescription>
          </div>
          <Badge variant={battle.active ? "default" : "secondary"}>
            {battle.active ? "Em andamento" : "Finalizada"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {battle.campaign?.imageUrl && (
            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={battle.campaign.imageUrl}
                alt={battle.campaign.name || "Campaign"}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
                unoptimized={false}
                sizes="(max-width: 640px) 64px, 80px"
              />
            </div>
          )}
          <div className="space-y-2 flex-grow">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turnos:</span>
              <span>{battle.round || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span>
                {battle.createdAt
                  ? new Date(battle.createdAt).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/battles/${battle._id}`}>Visualizar</Link>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link href={`/dashboard/battles/${battle._id}/edit`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Batalhas</h1>
        <Link href="/dashboard/battles/newBattle">
          <Button>Criar nova batalha</Button>
        </Link>
      </div>

      {battles.length > 0 ? (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Em andamento ({activeBattles.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Finalizadas ({inactiveBattles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeBattles.length > 0 ? (
                activeBattles.map((battle) => (
                  <BattleCard key={battle._id} battle={battle} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Nenhuma batalha em andamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      Você não tem batalhas ativas no momento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {inactiveBattles.length > 0 ? (
                inactiveBattles.map((battle) => (
                  <BattleCard key={battle._id} battle={battle} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Nenhuma batalha finalizada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      Você não tem batalhas finalizadas no momento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">
              Nenhuma Batalha Encontrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Você ainda não criou nenhuma batalha. Clique no botão acima para
              criar sua primeira batalha.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyBattlesDashboard;
