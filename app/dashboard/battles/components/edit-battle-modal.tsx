"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateBattle } from "@/lib/actions/battle.actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = zod.object({
  name: zod.string().min(1, "Nome é obrigatório"),
  round: zod.coerce.number().min(1, "O round deve ser pelo menos 1"),
  active: zod.boolean(),
});

interface EditBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battle: {
    _id: string;
    name: string;
    round: number;
    active: boolean;
  } | null;
}

export function EditBattleModal({
  open,
  onOpenChange,
  battle,
}: EditBattleModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      round: 1,
      active: true,
    },
  });

  useEffect(() => {
    if (battle) {
      form.reset({
        name: battle.name,
        round: battle.round,
        active: battle.active,
      });
    }
  }, [battle, form]);

  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    if (!battle) return;

    setIsLoading(true);

    try {
      const response = await updateBattle(battle._id, values);

      if (!response.ok) {
        toast.error("Erro", {
          description: response.message || "Falha ao atualizar a batalha",
        });
        return;
      }

      toast.success("Sucesso", {
        description: "Batalha atualizada com sucesso",
      });

      setIsLoading(false);

      setTimeout(() => {
        onOpenChange(false);
      }, 1100);

    } catch (error) {
      console.error("Erro ao atualizar batalha:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao atualizar a batalha.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar batalha</DialogTitle>
          <DialogDescription>
            Faça alterações na sua batalha aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Batalha</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da batalha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="round"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round Atual</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">{field.value ? "Ativa" : "Inativa"}</span>
                      </div>

                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
