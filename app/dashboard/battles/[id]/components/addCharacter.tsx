import {
  addCharacterToBattle,
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
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const AddCharacterModal = () => {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: battleData } = await getBattleById(id);
      const { data: characterData } = await getCharactersByCampaign(
        battleData.campaign._id
      );

      // Filter out dead characters and characters already in battle
      const availableCharacters = characterData.filter((character) => {
        if (character.status === "dead") return false;
        const isInBattle = battleData.characters.some(
          (battleChar) => battleChar._id === character._id
        );
        return !isInBattle;
      });

      setCharacters(availableCharacters || []);
    };

    fetchData();
  }, [id]);

  const onSubmit = async () => {
    if (selectedCharacters.length === 0) {
      toast.error("Error", {
        description: "Please select at least one character",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      for (const characterId of selectedCharacters) {
        const response = await addCharacterToBattle(id, characterId);
        if (!response.ok) {
          toast.error("Error", {
            description:
              response.message || "Failed to add character to battle",
          });
        }
      }

      toast.success("Success", {
        description: "Characters added to battle successfully",
      });
      setIsOpen(false);
      setSelectedCharacters([]);
      window.location.reload();
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong",
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
          <Plus /> Personagem à batalha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar personagens à batalha</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {characters.length > 0 ? (
            <div className="space-y-4">
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
                  <Label htmlFor={character._id}>{character.name}</Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não há personagens disponíveis para adicionar à batalha
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting || selectedCharacters.length === 0}
          >
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCharacterModal;
