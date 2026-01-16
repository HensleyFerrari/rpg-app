"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { createBattle } from "@/lib/actions/battle.actions";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = zod.object({
  name: zod.string().min(3, {
    message: "O nome da batalha deve ter pelo menos 3 caracteres.",
  }),
  campaign: zod.string().min(2, {
    message: "Selecione uma campanha.",
  }),
});

interface CreateBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftData?: any;
  onSaveDraft: (data: any) => void;
}

export function CreateBattleModal({
  open,
  onOpenChange,
  draftData,
  onSaveDraft,
}: CreateBattleModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get("campaign");

  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const defaultValues = {
    name: draftData?.name || "",
    campaign: draftData?.campaign || campaignIdParam || "",
  };

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedValues = form.watch();
  useEffect(() => {
    if (open) {
      onSaveDraft(watchedValues);
    }
  }, [JSON.stringify(watchedValues), open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoadingCampaigns(true);
      try {
        const { data: myCampaigns } = await getMyCampaigns();
        if (myCampaigns) {
          setCampaigns(myCampaigns);
        }
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        toast.error("Erro", {
          description: "Não foi possível carregar as campanhas.",
        });
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    if (open) {
      fetchCampaigns();
    }
  }, [open]);


  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const battleData = {
        name: values.name,
        campaign: values.campaign,
        characters: [],
        active: true,
        round: 1,
      };

      const response = await createBattle(battleData);

      if (!response.ok) {
        toast.error("Erro", {
          description: response.message || "Não foi possível criar a batalha",
        });
        return;
      }

      toast.success("Batalha criada", {
        description: "A batalha foi criada com sucesso.",
      });

      onSaveDraft(null);

      onOpenChange(false);

      router.push(`/dashboard/battles/${response.data._id}`);

    } catch (error) {
      console.error("Erro ao criar batalha:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao criar a batalha.",
      });
    } finally {
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
          <DialogTitle>Nova Batalha</DialogTitle>
          <DialogDescription>
            Crie uma nova batalha para sua campanha. As informações são salvas automaticamente enquanto você edita.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Batalha</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da batalha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campanha</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCampaigns}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCampaigns ? "Carregando..." : "Selecione uma campanha"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campaigns && campaigns.length > 0 ? (
                        campaigns.map((camp) => (
                          <SelectItem key={camp._id} value={camp._id}>
                            {camp.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-campaigns" disabled>
                          {isLoadingCampaigns ? "Carregando..." : "Nenhuma campanha disponível"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Batalha"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
