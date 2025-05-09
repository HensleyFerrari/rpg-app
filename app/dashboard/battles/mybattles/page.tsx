import { getAllBattlesByUser } from "@/lib/actions/battle.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { BattleCard } from "../components/BattleCard";

const MyBattles = async () => {
  const battles = await getAllBattlesByUser();
  const currentUser = await getCurrentUser();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Batalhas</h1>
        <Button asChild>
          <Link
            href="/dashboard/battles/newBattle"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Batalha
          </Link>
        </Button>
      </div>

      {battles && battles.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {battles.data.map((battle: any) => (
            <BattleCard
              key={battle._id}
              battle={battle}
              currentUserId={currentUser?._id}
            />
          ))}
        </div>
      ) : (
        <Card>
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

export default MyBattles;
