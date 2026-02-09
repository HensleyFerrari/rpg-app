import { getAccessibleCharacters, getCharactersByOwner, getCharactersByCampaign } from "@/lib/actions/character.actions";
import { getCampaigns } from "@/lib/actions/campaign.actions";
import { UserPlus, Heart, AlertCircle, Users, VenetianMask, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterListView } from "@/components/CharacterListView";
import { Badge } from "@/components/ui/badge";
import { CharacterFilters } from "./_components/character-filters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { CharacterModal } from "./_components/character-modal";



export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    filter?: string;
    campaignId?: string;
  };
}

export default async function Personagens({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { filter, campaignId } = resolvedParams;

  // Fetch campaigns for the filter dropdown
  const campaignsResponse = await getCampaigns();
  const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : []; // Handle if it returns {ok, data} or just data. Based on file view, it returns serialized data directly (array). Wait, let me double check getCampaigns.
  // Checking getCampaigns in campaign.actions.ts: returns serializeData(campaigns) which is an array.

  // Determine which characters to fetch
  let response;
  let title = "Todos os Personagens";
  let description = "Gerencie todos os personagens e NPCs das suas aventuras.";

  if (filter === "mine") {
    response = await getCharactersByOwner();
    title = "Meus Personagens";
    description = "Gerencie seus heróis e NPCs criados por você.";
  } else if (campaignId) {
    response = await getCharactersByCampaign(campaignId);
    const campaign = campaigns.find((c: any) => c._id === campaignId);
    title = campaign ? `Personagens: ${campaign.name}` : "Personagens da Campanha";
    description = "Personagens vinculados a esta campanha specific.";
  } else {
    response = await getAccessibleCharacters();
  }

  const characters = response.ok ? (response.data as any[]) || [] : [];

  // Get current user to check ownership
  const currentUser = await getCurrentUser();

  const playerCharacters = characters.filter((char) => !char.isNpc);
  const npcCharacters = characters.filter((char) => char.isNpc);

  const renderCharacterSection = (list: any[], type: "pc" | "npc") => {
    const alive = list.filter((char) => char.status === "alive");
    const dead = list.filter((char) => char.status === "dead");
    const emptyMessage = type === "pc" ? "Nenhum personagem encontrado." : "Nenhum NPC encontrado.";

    if (list.length === 0) {
      return (
        <Card className="w-full mt-6 border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {type === "pc" ? (
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            ) : (
              <VenetianMask className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              {type === "pc" ? "Nenhum personagem encontrado" : "Nenhum NPC encontrado"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{emptyMessage}</p>

            {type === "pc" && (
              <Link
                href={{
                  query: { ...resolvedParams, action: "new-character" },
                }}
              >
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Criar Novo Personagem
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8 mt-6">
        {/* Alive Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground/90">Vivos</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{alive.length}</Badge>
          </div>
          <CharacterListView
            characters={alive}
            currentUserId={currentUser?._id?.toString()}
          />
        </div>

        {/* Dead Section */}
        {dead.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Skull className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground/90">Mortos</h2>
              <Badge variant="secondary" className="border-none">{dead.length}</Badge>
            </div>
            <CharacterListView
              characters={dead}
              currentUserId={currentUser?._id?.toString()}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Link
          href={{
            query: { ...resolvedParams, action: "new-character" },
          }}
        >
          <Button className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" /> Novo Personagem
          </Button>
        </Link>
      </div>

      <CharacterFilters campaigns={campaigns} />



      {!response.ok ? (
        <div className="text-center py-10 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="font-semibold text-destructive">
            Erro ao carregar dados: {response.message}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="characters" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> Jogadores
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <VenetianMask className="h-4 w-4" /> NPCs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="focus-visible:outline-none focus-visible:ring-0">
            {renderCharacterSection(playerCharacters, "pc")}
          </TabsContent>

          <TabsContent value="npcs" className="focus-visible:outline-none focus-visible:ring-0">
            {renderCharacterSection(npcCharacters, "npc")}
          </TabsContent>
        </Tabs>
      )}
      <CharacterModal />
    </div>
  );
}
