"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Skull, User, Users } from "lucide-react";
import Link from "next/link";
import { CharacterCardActions } from "./character-card-actions";

interface CharacterListProps {
  characters: any[];
  isOwner: boolean;
  isNpc?: boolean;
  campaignId: string;
}

export function CharacterList({
  characters,
  isOwner,
  isNpc = false,
  campaignId,
}: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 border-dashed">
        <Users className="h-12 w-12 mb-4 opacity-20" />
        <p>Nenhum {isNpc ? "NPC" : "personagem"} nesta campanha.</p>
        <Link
          href={`/dashboard/personagens/new?campaign=${campaignId}${isNpc ? "&isNpc=true" : ""
            }`}
          className="mt-4"
        >
          <Button variant="outline">
            Criar {isNpc ? "NPC" : "Personagem"}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">
          Lista de {isNpc ? "NPCs" : "Personagens"}
        </span>
        <span className="text-xs text-muted-foreground">
          {characters.length} {isNpc ? "NPCs" : "personagens"}
        </span>
      </div>
      <div className="divide-y">
        {characters.map((character) => (
          <div
            key={character._id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group bg-card"
          >
            <Link
              href={`/dashboard/personagens/${character._id}`}
              className="flex items-center gap-4 flex-1"
            >
              <Avatar className="h-10 w-10 text-xs rounded-full border border-border">
                <AvatarImage src={character.characterUrl} alt={character.name} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {character.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {character.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {character.status === "dead" && (
                    <>
                      <span>•</span>
                      <span className="text-destructive flex items-center gap-1">
                        <Skull className="h-3 w-3" /> Morto
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <CharacterCardActions
                characterId={character._id}
                isNpc={!!character.isNpc}
                isOwner={isOwner}
                characterName={character.name}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
