"use client";

import { useState, useEffect, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createCharacter } from "@/lib/actions/character.actions";
import { getCampaignById, getCampaigns } from "@/lib/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// Schema de validação baseado no modelo de Character
const characterFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  campaign: z.string().min(1, {
    message: "Campanha é obrigatória.",
  }),
  characterUrl: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(["alive", "dead"]).default("alive"),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

// Interface para as campanhas
interface Campaign {
  _id: string;
  name: string;
}

// Create a separate form component that uses useSearchParams
const CharacterForm = () => {
  const { data } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignFromUrl = searchParams.get("campaign");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Buscar campanhas quando o componente é montado
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsData = await getCampaignById(campaignFromUrl);
        setCampaigns(campaignsData.data);
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        toast("Não foi possível carregar as campanhas.");
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    if (!campaignFromUrl) {
      router.push("/dashboard/personagens/");
    }
    fetchCampaigns();
  }, [campaignFromUrl]);

  // Valores default do formulário
  const defaultValues: Partial<CharacterFormValues> = {
    name: "",
    campaign: "",
    characterUrl: "",
    message: "",
    status: "alive",
  };

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      ...defaultValues,
      campaign: campaignFromUrl || "",
    },
  });

  async function onSubmit(values: CharacterFormValues) {
    setIsSubmitting(true);
    try {
      const response = await createCharacter({
        name: values.name,
        owner: data?.user?.email || "",
        campaign: values.campaign,
        characterUrl: values.characterUrl || "",
        message: values.message,
        status: values.status,
      });
      if (response.ok) {
        toast.success("Sucesso!", {
          description: "Personagem criado com sucesso.",
        });

        router.push(`/dashboard/personagens/${response?.data?._id}`);
      } else {
        toast.error("Erro Ao criar personagem");
      }
    } catch (error) {
      toast.error("Erro ao criar personagem");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do personagem" {...field} />
              </FormControl>
              <FormDescription>
                Digite o nome do seu personagem.
              </FormDescription>
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
                defaultValue={field.value}
                disabled={!!campaignFromUrl}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma campanha" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCampaigns ? (
                    <SelectItem value="loading" disabled>
                      Carregando campanhas...
                    </SelectItem>
                  ) : campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        {campaign.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-campaigns" disabled>
                      Nenhuma campanha encontrada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {campaignFromUrl
                  ? "Campanha pré-selecionada da URL"
                  : "Selecione a campanha para este personagem."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="characterUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="URL da imagem do personagem" {...field} />
              </FormControl>
              <FormDescription>
                Adicione uma URL para a imagem do seu personagem (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem/Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do personagem ou mensagem"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Adicione uma descrição ou mensagem sobre o personagem
                (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="alive">Vivo</SelectItem>
                  <SelectItem value="dead">Morto</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Status atual do personagem.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Personagem"}
        </Button>
      </form>
    </Form>
  );
};

// Main page component with Suspense boundary
const NewCharacter = () => {
  return (
    <div className="container mx-auto py-10">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Personagens", href: "/dashboard/personagens" },
          { label: "Novo Personagem" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Criar Novo Personagem</h1>
        <p className="text-muted-foreground">
          Preencha os dados para criar um novo personagem
        </p>
      </div>

      <Suspense fallback={<div>Carregando formulário...</div>}>
        <CharacterForm />
      </Suspense>
    </div>
  );
};

export default NewCharacter;
