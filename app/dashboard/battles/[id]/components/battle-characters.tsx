import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/utils";
import { Shield, Swords } from "lucide-react";
import { Skull, Heart } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { updateCharacterStatus } from "@/modules/rpg/character/character.actions";
import { toast } from "sonner";
import type { Battle, User } from "../types";

interface BattleCharactersProps {
  battle: Battle;
  currentUser: User | null;
  onBattleUpdate: (updater: (prev: Battle | null) => Battle | null) => void;
}

export const BattleCharacters = memo(function BattleCharacters({
  battle,
  currentUser,
  onBattleUpdate,
}: BattleCharactersProps) {
  const handleStatusToggle = useCallback(
    async (char: Battle["characters"][number]) => {
      if (
        currentUser?._id !== battle.owner._id &&
        currentUser?._id !== char.owner
      ) {
        toast.error(
          "Você não tem permissão para alterar o status deste personagem"
        );
        return;
      }

      const newStatus = char.status === "alive" ? "dead" : "alive";
      const result = await updateCharacterStatus(char._id, newStatus);

      if (result.ok) {
        toast.success(
          `Status de ${char.name} atualizado para ${
            newStatus === "alive" ? "Vivo" : "Morto"
          }`
        );
        onBattleUpdate((prev) =>
          prev
            ? {
                ...prev,
                characters: prev.characters.map((c) =>
                  c._id === char._id ? { ...c, status: newStatus } : c
                ),
              }
            : null
        );
      } else {
        toast.error("Erro ao atualizar status");
      }
    },
    [currentUser?._id, battle.owner._id, onBattleUpdate]
  );

  const allies = battle.characters.filter(
    (char) => !char.alignment || char.alignment === "ally"
  );
  const enemies = battle.characters.filter(
    (char) => char.alignment === "enemy"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Allies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Aliados
        </h3>
        <div className="space-y-3">
          {allies.map((char) => (
            <CharacterRow
              key={char._id}
              char={char}
              canEdit={
                currentUser?._id === battle.owner._id ||
                currentUser?._id === char.owner
              }
              onToggleStatus={handleStatusToggle}
            />
          ))}
          {allies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
              <Shield className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum aliado.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Enemies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Swords className="h-5 w-5 text-red-500" />
          Inimigos
        </h3>
        <div className="space-y-3">
          {enemies.map((char) => (
            <CharacterRow
              key={char._id}
              char={char}
              canEdit={
                currentUser?._id === battle.owner._id ||
                currentUser?._id === char.owner
              }
              onToggleStatus={handleStatusToggle}
            />
          ))}
          {enemies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
              <Swords className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum inimigo.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

// Extracted row component to avoid re-rendering all rows on single status change
const CharacterRow = memo(function CharacterRow({
  char,
  canEdit,
  onToggleStatus,
}: {
  char: Battle["characters"][number];
  canEdit: boolean;
  onToggleStatus: (char: Battle["characters"][number]) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card/50 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={cn(
              "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
              char.status === "dead" ? "bg-red-500" : "bg-green-500"
            )}
          />
          <CharacterAvatar
            src={char.characterUrl}
            isNpc={char.isNpc}
            className={cn(
              "h-10 w-10",
              char.status === "dead" && "grayscale opacity-70"
            )}
          />
        </div>
        <span
          className={cn(
            "font-medium",
            char.status === "dead" && "line-through text-muted-foreground"
          )}
        >
          {char.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleStatus(char)}
        disabled={!canEdit}
        className="hover:bg-background"
      >
        {char.status === "alive" ? (
          <Skull className="h-4 w-4 text-red-500" />
        ) : (
          <Heart className="h-4 w-4 text-green-500" />
        )}
      </Button>
    </div>
  );
});
