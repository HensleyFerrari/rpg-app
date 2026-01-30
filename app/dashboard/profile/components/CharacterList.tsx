import Link from "next/link";
import { CharacterDocument } from "@/models/Character";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Badge } from "@/components/ui/badge";

interface CharacterListProps {
  characters: CharacterDocument[];
}

export function CharacterList({ characters }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card/50 border-dashed">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Nenhum personagem encontrado</h3>
        <p className="text-muted-foreground max-w-sm mt-2 mb-4">
          Você ainda não possui personagens. Crie um herói ou NPC para começar.
        </p>
        <Button asChild>
            <Link href="/dashboard?action=new-character">Criar Personagem</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character) => (
        <Card key={character._id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
            <div className="p-6 flex flex-row items-center gap-4">
                <CharacterAvatar
                    src={character.characterUrl}
                    alt={character.name}
                    isNpc={character.isNpc}
                    size={64}
                />
                <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight line-clamp-1">{character.name}</h3>
                    <div className="flex items-center gap-2">
                         <Badge variant={character.isNpc ? "secondary" : "default"} className="text-[10px] px-1 py-0 h-5">
                            {character.isNpc ? "NPC" : "PC"}
                         </Badge>
                         <Badge variant={character.status === 'alive' ? "outline" : "destructive"} className="text-[10px] px-1 py-0 h-5">
                            {character.status === 'alive' ? "Vivo" : "Morto"}
                         </Badge>
                    </div>
                </div>
            </div>

          <CardContent className="flex-1 pt-0">
             <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Campanha: </span>
                {/* @ts-expect-error - campaign might be populated or ID */}
                {character.campaign?.name || "Desconhecida"}
             </div>
             {character.message && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                    &quot;{character.message}&quot;
                </p>
             )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="ghost">
              <Link href={`/dashboard/personagens/${character._id}`}>
                Ver Ficha <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
