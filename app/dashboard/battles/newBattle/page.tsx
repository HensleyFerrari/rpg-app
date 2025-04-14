"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBattle } from "@/lib/actions/battle.actions";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CampaignDocument } from "@/models/Campaign";

// Type for creating a new battle (subset of BattleDocument)
type CreateBattleParams = {
  name: string;
  campaign: string;
  characters: string[];
  active: boolean;
  round: number;
};

const formSchema = zod.object({
  name: zod.string().min(3, {
    message: "O nome da batalha deve ter pelo menos 3 caracteres.",
  }),
  campaign: zod.string().min(2, {
    message: "Selecione uma campanha.",
  }),
});

const BattleForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaign");
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignDocument[]>([]);

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      campaign: campaignId || "",
    },
  });

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsData = await getMyCampaigns();
        setCampaigns(campaignsData.data);
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        toast.error("Erro", {
          description: "Não foi possível carregar as campanhas.",
        });
      }
    };

    fetchCampaigns();
  }, []);

  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const battleData: CreateBattleParams = {
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
                disabled={!!campaignId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma campanha" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        {campaign.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-campaigns" disabled>
                      Nenhuma campanha criada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Batalha"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const NewBattle = () => {
  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Batalhas", href: "/dashboard/battles" },
          { label: "Nova Batalha" },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nova Batalha</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <BattleForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBattle;
