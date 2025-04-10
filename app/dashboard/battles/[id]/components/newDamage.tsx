import { getBattleById } from "@/lib/actions/battle.actions";
import {
  getCharacterByActualUser,
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

const NewDamage = () => {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const battle = await getBattleById(id);
      if (user._id === battle.data.owner._id) {
        const allCharacter = await getCharactersByCampaign(
          battle.data.campaign._id
        );
        setCharacters(allCharacter.data);
      } else {
        const allCharacter = await getCharactersByActualUserAndCampaign(
          battle.data.campaign._id
        );
        setCharacters(allCharacter.data);
      }
    };
    fetchData();
  }, [id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        battle: id,
      };

      const created = await createDamage(payload);
      if (created.ok) {
        toast.success("Success", {
          description: created.message,
        });
        setOpen(false);
        window.location.reload();
        // form.reset();
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
          <Button variant="default">
            <Plus /> Dano
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register New Damage</DialogTitle>
            <DialogDescription>
              Enter the details of the damage dealt in this battle.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="character"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character</FormLabel>
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
                        {characters.map((character: any) => (
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
                  {isSubmitting ? "Registering..." : "Register Damage"}
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
