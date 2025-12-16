import { getAllCharacters } from "@/lib/actions/character.actions";
import PersonagemCard from "@/components/PersonagemCard";
import { UserPlus, Skull, Heart, AlertCircle, Users, VenetianMask } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Personagens() {
  const response = await getAllCharacters();
  const characters = response.ok ? (response.data as any[]) || [] : [];

  const rawPlayerCharacters = characters.filter((char) => !char.isNpc);
  const rawNpcCharacters = characters.filter((char) => char.isNpc);

  const mapToPersonagem = (chars: any[]) =>
    chars.map((char) => ({
      _id: char._id.toString(),
      name: char.name,
      owner: char.owner.toString(),
      campaign: {
        _id: char.campaign._id.toString(),
        name: char.campaign.name.toString(),
      },
      characterUrl: char.characterUrl || "",
      battles: char.battles?.map((b: any) => b.toString()) || [],
      message: char.message || "",
      status: char.status,
      createdAt: char.createdAt,
      updateAt: char.updateAt,
      isNpc: char.isNpc,
    }));

  const playerCharacters = mapToPersonagem(rawPlayerCharacters);
  const npcCharacters = mapToPersonagem(rawNpcCharacters);

  const renderCharacterList = (list: typeof playerCharacters, type: "pc" | "npc") => {
    const alive = list.filter((char) => char.status === "alive");
    const dead = list.filter((char) => char.status === "dead");
    const emptyMessage = type === "pc" ? "Ainda não há personagens vivos." : "Ainda não há NPCs vivos.";

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
              {type === "pc" ? "Nenhum personagem encontrado" : "Nenhum NPC encontrado"}
            </h3>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8 mt-6">
        {/* Alive Characters Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Vivos</h2>
            <span className="text-muted-foreground ml-2">({alive.length})</span>
          </div>
          {alive.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alive.map((personagem) => (
                <PersonagemCard key={personagem._id} personagem={personagem} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{emptyMessage}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dead Characters Section */}
        {dead.length > 0 && (
          <div>
            <Separator className="my-8" />
            <div className="flex items-center gap-2 mb-4">
              <Skull className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Mortos</h2>
              <span className="text-muted-foreground ml-2">({dead.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dead.map((personagem) => (
                <PersonagemCard key={personagem._id} personagem={personagem} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personagens e NPCs</h1>
      </div>

      {!response.ok ? (
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-red-500">
            Erro ao carregar dados: {response.message}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="characters" className="flex gap-2">
              <Users className="h-4 w-4" /> Personagens
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex gap-2">
              <VenetianMask className="h-4 w-4" /> NPCs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters">
            {renderCharacterList(playerCharacters, "pc")}
          </TabsContent>
          
          <TabsContent value="npcs">
            {renderCharacterList(npcCharacters, "npc")}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
