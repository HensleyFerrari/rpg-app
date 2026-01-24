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
import { Plus, Swords, Heart, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form validation schema
const formSchema = z.object({
  character: z.string().optional(),
  target: z.string().optional(),
  type: z.enum(["damage", "heal", "other"]).default("damage"),
  damage: z.number().min(0).optional(),
  description: z.string().optional(),
  isCritical: z.boolean().default(false),
}).refine((data) => {
  if (data.type !== "other" && !data.character) {
    return false;
  }
  return true;
}, {
  message: "Personagem é obrigatório para esta ação",
  path: ["character"],
}).refine((data) => {
  if (data.type === "other" && !data.description) {
    return false;
  }
  return true;
}, {
  message: "Descrição é obrigatória para este tipo de ação",
  path: ["description"],
});

interface DamagePayload {
  battle: string;
  campaign: string;
  owner: string;
  character?: string;
  target?: string;
  type: "damage" | "heal" | "other";
  damage?: number;
  description?: string;
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

interface NewDamageProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const NewDamage = ({ className, variant = "default" }: NewDamageProps) => {
  const { id } = useParams<{ id: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allBattleCharacters, setAllBattleCharacters] = useState<Character[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasCharacter, setUserHasCharacter] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      character: "",
      target: "none",
      type: "damage" as "damage" | "heal" | "other",
      damage: 0,
      description: "",
      isCritical: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      const battle = await getBattleById(id as string);

      if (battle.data && battle.data.characters) {
        setAllBattleCharacters(battle.data.characters);
      }

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
        character: data.character || undefined,
        target: data.type === "other" || data.target === "none" ? undefined : data.target,
        type: data.type,
        damage: data.type === "other" ? 0 : data.damage,
        description: data.description,
        isCritical: data.type === "other" ? false : data.isCritical,
        round: battle.data.round,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={className}
          disabled={!userHasCharacter}
          title={
            !userHasCharacter
              ? "Você precisa ter um personagem ativo na batalha para registrar ação"
              : ""
          }
        >
          <Plus className={className?.includes("gap-2") ? "h-4 w-4" : ""} /> Ação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registre uma nova ação</DialogTitle>
          <DialogDescription>
            Adicione um novo dano ou cura à batalha.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Ação</FormLabel>
                  <FormControl>
                    <Tabs
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="damage" className="flex items-center gap-2">
                          <Swords className="h-4 w-4" /> Dano
                        </TabsTrigger>
                        <TabsTrigger value="heal" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" /> Cura
                        </TabsTrigger>
                        <TabsTrigger value="other" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Evento
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="character"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem está agindo? {form.watch("type") === "other" && "(Opcional)"}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um personagem..." />
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

              {form.watch("type") !== "other" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="damage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("type") === "damage"
                            ? "Valor do Dano"
                            : "Valor da Cura"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alvo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {allBattleCharacters.map(
                              (character: Character) => (
                                <SelectItem
                                  key={character._id}
                                  value={character._id}
                                >
                                  {character.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isCritical"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ação Crítica</FormLabel>
                          <FormDescription>
                            Dobre o efeito da ação.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          form.watch("type") === "other"
                            ? "Ex: A tempestade se intensifica..."
                            : "Ex: Um golpe poderoso que rasga a armadura..."
                        }
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("type") === "other"
                        ? "Descreva o evento narrativo."
                        : "Adicione detalhes narrativos à ação."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Confirmar Ação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDamage;
