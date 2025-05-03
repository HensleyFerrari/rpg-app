import { getAllBattles } from "@/lib/actions/battle.actions";
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
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import ChangeRound from "./[id]/components/changeRound";

const BattlesDashboard = async () => {
  const battles = await getAllBattles();
  const currentUser = await getCurrentUser();

  // Separate battles into active and inactive
  const activeBattles = battles.data.filter((battle: any) => battle.active);
  const inactiveBattles = battles.data.filter((battle: any) => !battle.active);

  const BattleCard = async ({ battle }: any) => (
    <Card
      key={battle?._id}
      className="shadow hover:shadow-lg transition-shadow duration-300"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{battle.name || "Unnamed Battle"}</CardTitle>
            <CardDescription>
              {battle.campaign?.name || "No Campaign"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={battle.active ? "default" : "secondary"}>
              {battle.active ? "Em andamento" : "Finalizada"}
            </Badge>
            {currentUser?._id === battle.owner?._id && battle.active && (
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
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium">
                {battle.owner?.name || "Unknown"}
              </span>
            </div>
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
          <Link href={`/dashboard/battles/${battle?._id}`}>Visualizar</Link>
        </Button>
        {currentUser?._id === battle.owner?._id && (
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/battles/${battle?._id}/edit`}>Editar</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todas as Batalhas</h1>
      </div>

      {battles && battles.data.length > 0 ? (
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
                activeBattles.map((battle: any) => (
                  <BattleCard key={battle?._id} battle={battle} />
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
                      Não há batalhas ativas no momento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {inactiveBattles.length > 0 ? (
                inactiveBattles.map((battle: any) => (
                  <BattleCard key={battle?._id} battle={battle} />
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
                      Não há batalhas finalizadas no momento.
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
              Nenhuma batalha encontrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Você ainda não possui batalhas. Crie uma nova batalha para começar
              a jogar!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BattlesDashboard;
