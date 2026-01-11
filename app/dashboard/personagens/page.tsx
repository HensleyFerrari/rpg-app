import { getAllCharacters } from "@/lib/actions/character.actions";
import { UserPlus, Heart, AlertCircle, Users, VenetianMask, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterListView } from "@/components/CharacterListView";

export default async function Personagens() {
  const response = await getAllCharacters();
  const characters = response.ok ? (response.data as any[]) || [] : [];

  const playerCharacters = characters.filter((char) => !char.isNpc);
  const npcCharacters = characters.filter((char) => char.isNpc);

  const renderCharacterSection = (list: any[], type: "pc" | "npc") => {
    const alive = list.filter((char) => char.status === "alive");
    const dead = list.filter((char) => char.status === "dead");
    const emptyMessage = type === "pc" ? "Nenhum personagem encontrado." : "Nenhum NPC encontrado.";

    if (list.length === 0) {
      return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {type === "pc" ? (
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            ) : (
              <VenetianMask className="h-12 w-12 text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              {type === "pc" ? "Nenhum personagem cadastrado" : "Nenhum NPC cadastrado"}
            </h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
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
          <CharacterListView characters={alive} />
        </div>

        {/* Dead Section */}
        {dead.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Skull className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground/90">Mortos</h2>
              <Badge variant="secondary" className="border-none">{dead.length}</Badge>
            </div>
            <CharacterListView characters={dead} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Personagens</h1>
        <p className="text-muted-foreground">Gerencie todos os personagens e NPCs das suas aventuras.</p>
      </div>

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
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
