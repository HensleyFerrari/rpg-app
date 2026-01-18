import {
  addCharacterToBattle,
  createQuickCharacters,
  getBattleById,
} from "@/lib/actions/battle.actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCharactersByCampaign } from "@/lib/actions/character.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CharacterDocument } from "@/models/Character";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

const AddCharacterModal = () => {
  const { id } = useParams();
  const [characters, setCharacters] = useState<CharacterDocument[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add State
  const [quickNames, setQuickNames] = useState("");
  const [alignment, setAlignment] = useState<"ally" | "enemy">("ally");

  useEffect(() => {
    const fetchData = async () => {
      const battleId =
        typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const { data: battleData } = await getBattleById(battleId);
      const { data: characterData } = await getCharactersByCampaign(
        battleData.campaign._id
      );

      if (!characterData || !Array.isArray(characterData)) {
        setCharacters([]);
        return;
      }

      const availableCharacters = characterData.filter(
        (character: CharacterDocument) => {
          if (character.status === "dead") return false;
          const isInBattle = battleData.characters.some(
            (battleChar: CharacterDocument) => battleChar._id === character._id
          );
          return !isInBattle;
        }
      );

      setCharacters(availableCharacters);
    };

    if (isOpen) {
      fetchData();
    }
  }, [id, isOpen]);

  const onSubmitExisting = async () => {
    if (selectedCharacters.length === 0) {
      toast.error("Error", {
        description: "Please select at least one character",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const battleId =
        typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

      let successCount = 0;
      let lastError = "";

      // Add characters sequentially
      for (const characterId of selectedCharacters) {
        const response = await addCharacterToBattle(battleId, characterId);
        if (response.ok) {
          successCount++;
        } else {
          lastError = response.message || "Failed to add character";
        }
      }

      if (successCount > 0) {
        toast.success("Success", {
          description: `${successCount} character(s) added successfully`,
        });

        // Fetch updated battle data and dispatch event
        const updatedBattle = await getBattleById(battleId);
        if (updatedBattle.ok) {
          window.dispatchEvent(
            new CustomEvent("battleUpdated", { detail: updatedBattle.data })
          );
        }

        setIsOpen(false);
        setSelectedCharacters([]);
      }

      if (lastError && successCount < selectedCharacters.length) {
        toast.error("Warning", {
          description: `Some characters could not be added: ${lastError}`,
        });
      }

    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", {
        description: "Something went wrong: " + errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitQuick = async () => {
    const names = quickNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      toast.error("Error", {
        description: "Please enter at least one character name",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const battleId =
        typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

      const response = await createQuickCharacters(battleId, names, alignment);

      if (response.ok) {
        toast.success("Success", {
          description: response.message,
        });

        // Fetch updated battle data and dispatch event
        const updatedBattle = await getBattleById(battleId);
        if (updatedBattle.ok) {
          window.dispatchEvent(
            new CustomEvent("battleUpdated", { detail: updatedBattle.data })
          );
        }

        setIsOpen(false);
        setQuickNames("");
      } else {
        toast.error("Error", {
          description: response.message || "Failed to create characters",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", {
        description: "Something went wrong: " + errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters((current) =>
      current.includes(characterId)
        ? current.filter((id) => id !== characterId)
        : [...current, characterId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Personagens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Personagens da Batalha</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existentes</TabsTrigger>
            <TabsTrigger value="quick">Criação Rápida</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 py-4">
            <div className="max-h-[300px] overflow-y-auto pr-2">
              {characters.length > 0 ? (
                <div className="space-y-3">
                  {characters.map((character) => (
                    <div
                      key={character._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={character._id}
                        checked={selectedCharacters.includes(character._id)}
                        onCheckedChange={() => toggleCharacter(character._id)}
                      />
                      <Label htmlFor={character._id} className="cursor-pointer font-normal">
                        {character.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-8">
                  Não há personagens disponíveis para adicionar.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={onSubmitExisting}
                disabled={isSubmitting || selectedCharacters.length === 0}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Adicionando..." : "Adicionar Selecionados"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Alinhamento</Label>
              <RadioGroup
                defaultValue="ally"
                value={alignment}
                onValueChange={(value) => setAlignment(value as "ally" | "enemy")}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ally" id="ally" />
                  <Label htmlFor="ally" className="font-normal cursor-pointer">Aliado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enemy" id="enemy" />
                  <Label htmlFor="enemy" className="font-normal cursor-pointer text-red-500">Inimigo</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-names">Nomes dos Personagens (um por linha)</Label>
              <Textarea
                id="quick-names"
                placeholder="Goblin Arqueiro&#10;Goblin Guerreiro&#10;Orc Chefe"
                className="min-h-[150px]"
                value={quickNames}
                onChange={(e) => setQuickNames(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Isso criará novos personagens vinculados a esta campanha e os adicionará automaticamente à batalha.
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={onSubmitQuick}
                disabled={isSubmitting || !quickNames.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Criando..." : "Criar e Adicionar"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCharacterModal;
