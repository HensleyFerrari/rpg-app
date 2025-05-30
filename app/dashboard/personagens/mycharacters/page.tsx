import { getCharactersByOwner } from "@/lib/actions/character.actions";
import PersonagemCard from "@/components/PersonagemCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Skull, Heart, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MyCharacters = async () => {
  const response = await getCharactersByOwner();
  const personagens = response.ok ? (response.data as any[]) || [] : [];

  const aliveCharacters = personagens.filter((char) => char.status === "alive");
  const deadCharacters = personagens.filter((char) => char.status === "dead");

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end items-center mb-6">
        {/* <Link href="/dashboard/personagens/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Criar Personagem
          </Button>
        </Link> */}
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
              Nenhum personagem encontrado
            </h3>
            {/* <p className="text-muted-foreground mb-6">
              Parece que você ainda não criou nenhum personagem. Que tal começar
              sua jornada agora?
            </p>
            <Link href="/dashboard/personagens/new">
              <Button size="lg" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Criar Meu Primeiro Personagem
              </Button>
            </Link> */}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Alive Characters Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Personagens Vivos</h2>
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
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Todos os seus personagens morreram! É hora de começar uma
                    nova aventura.
                  </p>
                  <Link href="/dashboard/personagens/new" className="mt-4">
                    <Button variant="outline" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Criar Novo Personagem
                    </Button>
                  </Link>
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
};

export default MyCharacters;
