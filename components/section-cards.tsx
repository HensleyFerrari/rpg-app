import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countCampaigns } from "@/lib/actions/campaign.actions";
import { countCharacters } from "@/lib/actions/character.actions";
import { Swords, Users, Crown, ScrollText } from "lucide-react";

export const SectionCards = async () => {
  const countCampaign = await countCampaigns();
  const countCharacter = await countCharacters();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Campanhas
          </CardTitle>
          <Crown className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{countCampaign}</div>
          <p className="text-xs text-muted-foreground">
            Campanhas criadas na plataforma
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Personagens
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{countCharacter}</div>
          <p className="text-xs text-muted-foreground">
            Personagens ativos no sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Batalhas Ativas</CardTitle>
          <Swords className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">Batalhas em andamento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sessões Realizadas
          </CardTitle>
          <ScrollText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">156</div>
          <p className="text-xs text-muted-foreground">
            Total de sessões jogadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
