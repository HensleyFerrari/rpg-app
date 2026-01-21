import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateDamage, deleteDamage } from "@/lib/actions/damage.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  X,
  Save,
  Loader2,
  Heart,
  Swords,
  AlertCircle,
  MessageSquare,
  User,
  Target,
  CalendarIcon,
  Trash
} from "lucide-react";

interface TurnDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turn: any;
  currentUser?: any;
  battle?: any;
}

const formSchema = z.object({
  character: z.string().optional(),
  target: z.string().optional(),
  type: z.enum(["damage", "heal", "other"]),
  damage: z.number().min(0).optional(),
  description: z.string().optional(),
  isCritical: z.boolean().default(false),
});

export function TurnDetailsModal({
  open,
  onOpenChange,
  turn,
  currentUser,
  battle,
}: TurnDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine permissions
  const isOwner = currentUser?._id === turn?.owner?._id || currentUser?._id === turn?.owner;
  const isGM = currentUser?._id === battle?.owner?._id || currentUser?._id === battle?.owner;
  const canEdit = isOwner || isGM;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      character: turn?.character?._id || "",
      target: turn?.target?._id || "none",
      type: turn?.type || "damage",
      damage: turn?.damage || 0,
      description: turn?.description || "",
      isCritical: turn?.isCritical || false,
    },
  });

  // Reset form when turn changes or modal opens
  if (!turn) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data desconhecida";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        target: data.target === "none" ? undefined : data.target,
      };

      const result = await updateDamage(turn._id, payload);

      if (result.ok) {
        toast.success("Turno atualizado com sucesso");
        setIsEditing(false);
        // Close modal or keep open with updated data? 
        // Logic usually updates parent via revalidatePath/pusher, preventing stale data might require closing or refetching. 
        // For now, let's keep it simple.
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar turno", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Erro inesperado");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este turno?")) return;

    try {
      setIsDeleting(true);
      const result = await deleteDamage(turn._id, turn.battle);

      if (result.ok) {
        toast.success("Turno excluído com sucesso");
        onOpenChange(false);
      } else {
        toast.error("Erro ao excluir turno", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Erro inesperado");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isEvent = turn.type === "other";
  const isHeal = turn.type === "heal";

  const battleCharacters = battle?.characters || [];

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setIsEditing(false); // Reset edit mode on close
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Rodada {turn.round}</Badge>
              <DialogTitle>Detalhes do Turno</DialogTitle>
            </div>
            {canEdit && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => {
                form.reset({
                  character: turn?.character?._id || "",
                  target: turn?.target?._id || "none",
                  type: turn?.type || "damage",
                  damage: turn?.damage || 0,
                  description: turn?.description || "",
                  isCritical: turn?.isCritical || false,
                });
                setIsEditing(true);
              }}>
                <Pencil className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
          </div>
          <DialogDescription>
            {isEditing ? "Edite as informações do turno." : "Informações detalhadas sobre este evento na batalha."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Tabs onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="damage">Dano</TabsTrigger>
                          <TabsTrigger value="heal">Cura</TabsTrigger>
                          <TabsTrigger value="other">Evento</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {form.watch("type") !== "other" && (
                  <FormField
                    control={form.control}
                    name="damage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="character"
                  render={({ field }) => (
                    <FormItem className={form.watch("type") === "other" ? "col-span-2" : ""}>
                      <FormLabel>Origem</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {battleCharacters.map((char: any) => (
                            <SelectItem key={char._id} value={char._id}>{char.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("type") !== "other" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alvo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {battleCharacters.map((char: any) => (
                              <SelectItem key={char._id} value={char._id}>{char.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isCritical"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3 mt-auto">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Crítico?
                        </FormLabel>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detalhes opcionais..." />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting || isDeleting}>
                    <X className="w-4 h-4 mr-1" /> Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isDeleting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Main Action Info */}
            <div className="flex flex-col gap-2 p-4 bg-muted/40 rounded-lg border">
              {!isEvent ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      {isHeal ? <Heart className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                      {isHeal ? "Cura Realizada" : "Dano Causado"}
                    </span>
                    <span className={`text-2xl font-bold ${isHeal ? "text-green-500" : "text-amber-500"}`}>
                      {turn.damage}
                    </span>
                  </div>
                  {turn.isCritical && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Acerto Crítico!
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Evento de Narrativa</span>
                </div>
              )}

              {turn.description && (
                <div className="mt-2 text-sm italic border-l-2 border-primary/20 pl-3 py-1">
                  "{turn.description}"
                </div>
              )}
            </div>

            <Separator />

            {/* Involvement */}
            <div className="grid grid-cols-2 gap-4">
              {(turn.character || !isEvent) && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <User className="w-3 h-3" /> Origem
                  </span>
                  <p className="text-sm font-medium truncate">{turn.character?.name || "Sistema"}</p>
                </div>
              )}
              {!isEvent && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Target className="w-3 h-3" /> Alvo
                  </span>
                  <p className="text-sm font-medium truncate">{turn.target?.name || "N/A"}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Criado em
                </span>
                <span>{formatDate(turn.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" /> Registrado por
                </span>
                <span className="font-medium">{turn.owner?.name || "Sistema"}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
