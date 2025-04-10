import { getCurrentUser } from "@/lib/actions/user.actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const AddCharacterModal = () => {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: battleData } = await getBattleById(id);
      const { data: characterData } = await getCharactersByCampaign(
        battleData.campaign._id
      );
      setCharacters(characterData);
    };

    fetchData();
  }, [id]);

  const onSubmit = async () => {
    if (!selectedCharacter) {
      toast.error("Error", {
        description: "Please select a character",
      });
      return;
    }
    try {
      const response = await addCharacterToBattle(id, selectedCharacter);

      if (response.ok) {
        toast.success("Success", {
          description: "Character added to battle successfully",
        });
        setIsOpen(false);
        window.location.reload();
        setSelectedCharacter("");
      } else {
        toast.error("Error", {
          description: response.message || "Failed to add character to battle",
        });
      }
    } catch (error) {
      toast("Error", {
        description: "Something went wrong",
      });
    }
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
          <DialogTitle>Adicionar personagem à batalha</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="character" className="text-right">
              Personagem
            </Label>
            <Select
              value={selectedCharacter}
              onValueChange={setSelectedCharacter}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione um personagem" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((character) => (
                  <SelectItem key={character._id} value={character._id}>
                    {character.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCharacterModal;
