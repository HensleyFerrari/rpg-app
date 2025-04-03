"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome da batalha deve ter pelo menos 3 caracteres.",
  }),
  campaign: z.string().min(2, {
    message: "Selecione uma campanha.",
  }),
});

const NewBattle = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      campaign: "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      console.log("Form values submitted:", values);

      const battleCreated = await createBattle(values);
      if (!battleCreated) {
        toast.error("Erro", {
          description: "Não foi possivel criar a batalha",
        });
        return;
      }

      toast.success("Batalha criada", {
        description: "A batalha foi criada com sucesso.",
      });
      router.push("/dashboard/battles");
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nova Batalha</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Batalha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da batalha"
                        {...field}
                      />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Batalha"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBattle;
