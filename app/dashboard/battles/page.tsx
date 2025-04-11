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

const BattlesDashboard = async () => {
  const battles = await getAllBattles();
  const currentUser = await getCurrentUser();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todas as Batalhas</h1>
        <Link href="/dashboard/battles/newBattle">
          <Button>Criar nova batalha</Button>
        </Link>
      </div>

      {battles && battles.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {battles.data.map((battle) => (
            <Card
              key={battle._id}
              className="shadow hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle>{battle.name || "Unnamed Battle"}</CardTitle>
                <CardDescription>
                  {battle.campaign?.name || "No Campaign"}
                </CardDescription>
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
                  <Link href={`/dashboard/battles/${battle._id}`}>
                    Visualizar
                  </Link>
                </Button>
                {currentUser._id === battle.owner._id && (
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/dashboard/battles/${battle._id}/edit`}>
                      Editar
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">No Battles Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You haven't created any battles yet. Click the button above to
              create your first battle.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BattlesDashboard;
