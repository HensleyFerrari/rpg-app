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
          href={`/dashboard/personagens/new?campaign=${campaignId}${
            isNpc ? "&isNpc=true" : ""
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
    <div className="space-y-4">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-9">Personagem</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Ações</div>
      </div>

      <div className="space-y-2">
        {characters.map((character) => (
          <div
            key={character._id}
            className="group relative flex flex-col md:grid md:grid-cols-12 gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors items-center"
          >
            {/* Character Info */}
            <div className="flex items-center gap-6 col-span-9 w-full">
              <Link href={`/dashboard/personagens/${character._id}`}>
                <Avatar className="h-12 w-12 md:h-16 md:w-16 rounded-full border border-border cursor-pointer shadow-sm hover:shadow-md transition-all">
                  <AvatarImage
                    src={character.characterUrl}
                    alt={character.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-full bg-muted">
                    <User className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/dashboard/personagens/${character._id}`}
                  className="text-lg md:text-xl font-bold hover:underline truncate block tracking-tight"
                >
                  {character.name}
                </Link>
                {/* Mobile Info */}
                <div className="flex flex-col text-sm text-muted-foreground md:hidden mt-1 gap-0.5">
                  <span className="truncate font-medium">
                    {character.class || character.race || "Desconhecido"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                      Lvl {character.level || 1}
                    </Badge>
                     <Badge
                        variant={
                          character.status === "alive" ? "default" : "destructive"
                        }
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {character.status === "alive" ? "Vivo" : "Morto"}
                      </Badge>
                  </div>
                </div>
              </div>
              
              {/* Mobile Actions */}
              <div className="md:hidden flex items-center absolute top-4 right-4">
                 <CharacterCardActions
                    characterId={character._id}
                    isNpc={!!character.isNpc}
                    isOwner={isOwner}
                    characterName={character.name}
                  />
              </div>
            </div>

            {/* Status - Desktop */}
            <div className="hidden md:flex items-center col-span-2">
              <Badge
                variant={
                  character.status === "alive" ? "default" : "destructive"
                }
                className="gap-1.5 pl-2 pr-2 py-1 text-sm"
              >
                {character.status === "alive" ? (
                  <Heart className="h-4 w-4 fill-current" />
                ) : (
                  <Skull className="h-4 w-4 fill-current" />
                )}
                {character.status === "alive" ? "Vivo" : "Morto"}
              </Badge>
            </div>

            {/* Actions - Desktop */}
            <div className="hidden md:flex justify-end col-span-1">
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
