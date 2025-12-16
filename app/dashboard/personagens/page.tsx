import { getAllCharacters } from "@/lib/actions/character.actions";
import PersonagemCard from "@/components/PersonagemCard";
import { UserPlus, Skull, Heart, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function Personagens() {
  const response = await getAllCharacters();
  const characters = response.ok ? (response.data as any[]) || [] : [];
  const filteredCharacters = characters.filter((char) => !char.isNpc);

  // Map CharacterDocument to Personagem type
  const personagens = filteredCharacters.map((char) => ({
    _id: char._id.toString(),
    name: char.name,
    owner: char.owner.toString(),
    campaign: {
      _id: char.campaign.toString(), // Fix: campaign is an ObjectId
      name: char.campaign.name.toString(),
    },
    characterUrl: char.characterUrl || "",
    battles: char.battles?.map((b: any) => b.toString()) || [],
    message: char.message || "",
    status: char.status,
    createdAt: char.createdAt, // Fix: correct property name
    updateAt: char.updateAt, // Fix: match the correct property name
  }));

  const aliveCharacters = personagens.filter((char) => char.status === "alive");
  const deadCharacters = personagens.filter((char) => char.status === "dead");

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todos os Personagens</h1>
      </div>

      {!response.ok ? (
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-red-500">
            Erro ao carregar personagens: {response.message}
          </p>
        </div>
      ) : personagens.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum personagem criado ainda
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Alive Characters Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Personagens Vivos</h2>
              <span className="text-muted-foreground ml-2">
                ({aliveCharacters.length})
              </span>
            </div>
            {aliveCharacters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aliveCharacters.map((personagem) => (
                  <PersonagemCard
                    key={personagem._id}
                    personagem={personagem}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Ainda não há personagens vivos no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Dead Characters Section */}
          {deadCharacters.length > 0 && (
            <div>
              <Separator className="my-8" />
              <div className="flex items-center gap-2 mb-4">
                <Skull className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Personagens Mortos</h2>
                <span className="text-muted-foreground ml-2">
                  ({deadCharacters.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deadCharacters.map((personagem) => (
                  <PersonagemCard
                    key={personagem._id}
                    personagem={personagem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
