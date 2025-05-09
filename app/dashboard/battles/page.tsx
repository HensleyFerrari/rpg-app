import { getAllBattles } from "@/lib/actions/battle.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BattleCard } from "./components/BattleCard";

const BattlesDashboard = async () => {
  const battles = await getAllBattles();
  const currentUser = await getCurrentUser();

  // Separate battles into active and inactive
  const activeBattles = battles.data.filter((battle: any) => battle.active);
  const inactiveBattles = battles.data.filter((battle: any) => !battle.active);

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
                  <BattleCard 
                    key={battle?._id} 
                    battle={battle}
                    currentUserId={currentUser?._id}
                  />
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
                  <BattleCard 
                    key={battle?._id} 
                    battle={battle}
                    currentUserId={currentUser?._id}
                  />
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
