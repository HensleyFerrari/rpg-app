import { Button } from "@/components/ui/button";
import {
  Card,
  //   CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ChangeRound from "../[id]/components/changeRound";

interface BattleCardProps {
  battle: any;
  currentUserId?: string;
}

export function BattleCard({ battle, currentUserId }: BattleCardProps) {
  const isOwner = currentUserId === battle.owner?._id;

  return (
    <Card className=" pt-0 flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative w-full aspect-video">
        {battle.campaign?.imageUrl ? (
          <Image
            src={battle.campaign.imageUrl}
            alt={battle.campaign.name || "Campaign"}
            fill
            className="object-cover"
            unoptimized={false}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <span className="text-4xl">⚔️</span>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {battle.name || "Unnamed Battle"}
            </CardTitle>
            <CardDescription>
              {battle.campaign?.name || "No Campaign"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={battle.active ? "default" : "secondary"}>
              {battle.active ? "Em andamento" : "Finalizada"}
            </Badge>
            {isOwner && battle.active && (
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

      {/* <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mestre:</span>
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
      </CardContent> */}

      <CardFooter className="mt-auto flex-col gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/battles/${battle?._id}`}>Visualizar</Link>
        </Button>
        {isOwner && (
          <Button variant="default" className="w-full" asChild>
            <Link href={`/dashboard/battles/${battle?._id}/edit`}>Editar</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
