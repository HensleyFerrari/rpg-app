import { getBattleById } from "@/lib/actions/battle.actions";
import {
  getCharactersByActualUserAndCampaign,
  getCharactersByCampaign,
} from "@/lib/actions/character.actions";
import { createDamage } from "@/lib/actions/damage.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  character: z.string().min(1, { message: "Character is required" }),
  damage: z.number().min(1, { message: "Damage must be at least 1" }),
  isCritical: z.boolean().default(false),
  round: z.number().min(1, { message: "Round must be at least 1" }),
});

interface DamagePayload {
  battle: string;
  campaign: string;
  owner: string;
  character: string;
  damage: number;
  isCritical: boolean;
  round: number;
}

interface Character {
  _id: string;
  name: string;
  owner: {
    _id: string;
  };
  campaign: {
    _id: string;
  };
}

const NewDamage = () => {
  const { id } = useParams<{ id: string }>();
  const [characters, setCharacters] = useState([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasCharacter, setUserHasCharacter] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      character: "",
      damage: 0,
      isCritical: false,
      round: 1,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      const battle = await getBattleById(id as string);

      if (user._id === battle.data.owner._id) {
        const characters = await getCharactersByCampaign(
          battle.data.campaign._id
        );
        if (characters.data && Array.isArray(characters.data)) {
          const filteredCharacters: any = characters.data.filter((char) => {
            if (char.status === "alive") {
              return char;
            }
          });
          setCharacters(filteredCharacters);
        }
        setUserHasCharacter(true);
      }

      if (user._id !== battle.data.owner._id) {
        const userCharacters = await getCharactersByActualUserAndCampaign(
          battle.data.campaign._id
        );

        if (userCharacters && Array.isArray(userCharacters)) {
          const filteredCharacters: any = userCharacters.filter((char) => {
            if (char.status === "alive") {
              return char;
            }
          });
          setCharacters(filteredCharacters);
          setUserHasCharacter(true);
        }
      }
    };

    fetchData();
  }, [id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!userHasCharacter) {
      toast.error("Error", {
        description:
          "Você precisa ter um personagem ativo na batalha para registrar dano.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const battle = await getBattleById(id as string);
      if (!battle.ok) {
        throw new Error("Battle not found");
      }

      const payload: DamagePayload = {
        battle: id as string,
        campaign: battle.data.campaign._id,
        owner: battle.data.owner._id,
        character: data.character,
        damage: data.damage,
        isCritical: data.isCritical,
        round: data.round,
      };

      const created = await createDamage(payload);
      if (created.ok) {
        toast.success("Success", {
          description: created.message,
        });
        setOpen(false);
        form.reset();
        const updatedBattle = await getBattleById(id as string);
        if (updatedBattle.ok) {
          window.dispatchEvent(
            new CustomEvent("battleUpdated", { detail: updatedBattle.data })
          );
        }
      } else {
        toast.error("Error", {
          description: created.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to register damage. Please try again.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            disabled={!userHasCharacter}
            title={
              !userHasCharacter
                ? "Você precisa ter um personagem ativo na batalha para registrar dano"
                : ""
            }
          >
            <Plus /> Dano
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registre um novo dano</DialogTitle>
            <DialogDescription>
              Adicione um novo dano a batalha.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="character"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personagem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a character" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {characters.map((character: Character) => (
                          <SelectItem key={character._id} value={character._id}>
                            {character.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="damage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="round"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCritical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Dano Crítico</FormLabel>
                      <FormDescription>
                        Marque essa opção se o dano for crítico.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Registrar Dano"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDamage;
