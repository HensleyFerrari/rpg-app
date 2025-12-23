"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateCharacter } from "@/lib/actions/character.actions";
import { MoreHorizontal, User, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CharacterCardActionsProps {
  characterId: string;
  isNpc: boolean;
  isOwner: boolean;
  characterName: string;
}

export function CharacterCardActions({
  characterId,
  isNpc,
  isOwner,
  characterName,
}: CharacterCardActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOwner) return null;

  const handleToggleNpc = async () => {
    try {
      setIsLoading(true);
      const result = await updateCharacter(characterId, { isNpc: !isNpc });

      if (result.ok) {
        toast.success(
          `${characterName} agora é ${!isNpc ? "um NPC" : "um Personagem"}`
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao atualizar personagem");
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleNpc}>
          {isNpc ? (
            <>
              <User className="mr-2 h-4 w-4" />
              Tornar Personagem
            </>
          ) : (
            <>
              <UserCog className="mr-2 h-4 w-4" />
              Tornar NPC
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
