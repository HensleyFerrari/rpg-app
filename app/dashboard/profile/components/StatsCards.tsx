import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";

interface StatsCardsProps {
  totalCampaigns: number;
  totalCharacters: number;
}

export function StatsCards({ totalCampaigns, totalCharacters }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Campanhas
          </CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCampaigns}</div>
          <p className="text-xs text-muted-foreground">
            Mundos criados por você
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Personagens
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCharacters}</div>
          <p className="text-xs text-muted-foreground">
            Heróis e NPCs em sua coleção
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
