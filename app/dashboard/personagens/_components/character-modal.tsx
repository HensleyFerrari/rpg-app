"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createCharacter, updateCharacter, getCharacterById } from "@/lib/actions/character.actions";
import { getCampaigns } from "@/lib/actions/campaign.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Switch } from "@/components/ui/switch";

// Schema unificado
const characterFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  campaign: z.string().min(1, {
    message: "Campanha é obrigatória.",
  }),
  characterUrl: z.string().optional().or(z.literal("")),
  message: z.string().optional(),
  status: z.enum(["alive", "dead"]).default("alive"),
  isNpc: z.boolean().default(false),
  alignment: z.enum(["ally", "enemy"]).default("ally"),
  isVisible: z.boolean().default(true),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

interface Campaign {
  _id: string;
  name: string;
  isAccepptingCharacters: boolean;
  owner?: {
    _id: string;
    name: string;
  };
}

export function CharacterModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Estados Baseados na URL
  const isCreateMode = searchParams.get("action") === "new-character";
  const editId = searchParams.get("editCharacter");
  const isOpen = isCreateMode || !!editId;

  // Estados Locais
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const campaignParam = searchParams.get("campaign") || searchParams.get("campaignId");
  const isNpcFromUrl = searchParams.get("isNpc") === "true";

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("editCharacter");
    params.delete("isNpc");
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const defaultValues: Partial<CharacterFormValues> = useMemo(() => ({
    name: "",
    campaign: "",
    characterUrl: "",
    message: "",
    status: "alive",
    isNpc: isNpcFromUrl,
    alignment: "ally",
    isVisible: true,
  }), [isNpcFromUrl]);

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues,
  });

  // Resetar form quando o modal fecha ou muda de modo
  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, form, defaultValues]);

  // Carregar Dados Iniciais (Campanhas e Personagem se for Edição)
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        // 1. Carregar Campanhas (Sempre necessário para o select)
        const campaignsData = await getCampaigns();
        if (campaignsData) {
          setCampaigns(campaignsData);
        }

        // 2. Se for edição, carregar dados do personagem
        if (editId) {
          const response = await getCharacterById(editId);
          if (response.ok && response.data) {
            const char = response.data as any;

            // Verificar permissões (opcional aqui pois o backend deve bloquear, mas bom para UX)
            const user = await getCurrentUser();
            const isOwner = char.owner._id === user?._id;
            const isCampaignOwner = char.campaign.owner._id === user?._id;

            if (!isOwner && !isCampaignOwner) {
              toast.error("Você não tem permissão para editar este personagem.");
              handleClose();
              return;
            }

            form.reset({
              name: char.name,
              campaign: char.campaign._id,
              characterUrl: char.characterUrl || "",
              message: char.message || "",
              status: char.status,
              isNpc: char.isNpc,
              alignment: char.alignment || "ally",
              isVisible: char.isVisible !== false,
            });
          } else {
            toast.error("Personagem não encontrado");
            handleClose();
          }
        } else if (isCreateMode) {
          // Modo Criação: Preencher defaults da URL
          form.reset({
            ...defaultValues,
            isNpc: isNpcFromUrl,
            campaign: campaignParam || "",
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, editId, isCreateMode, campaignParam, isNpcFromUrl, form, defaultValues, handleClose]);
  // Wait, handleClose is used inside loadData? No.
  // Oh, wait, in one error message it said handleClose missing deps in effect at line 163?
  // Previous lint output: 163:6 Warning: React Hook useEffect has missing dependencies: 'defaultValues', 'form', and 'handleClose'.
  // But wait, line 163 corresponds to the end of the effect. Let's see inside the effect. 
  // Line 128 calls handleClose().
  // And line 143 calls handleClose().
  // So yes, need handleClose.

  // So I need to define handleClose BEFORE this effect or use hoisting (which const doesn't support) or wrap in useCallback above.
  // I must move handleClose definition UP.



  const onSubmit = async (values: CharacterFormValues) => {
    setIsSubmitting(true);
    try {
      if (editId) {
        // Update
        const response = await updateCharacter(editId, values);
        if (response?.ok) {
          toast.success("Personagem atualizado com sucesso!");
          handleClose();
          router.refresh();
        } else {
          toast.error(response?.message || "Erro ao atualizar personagem");
        }
      } else {
        // Create

        // Validate if campaign is accepting characters
        const selectedCampaign = campaigns.find(c => c._id === values.campaign);
        if (selectedCampaign && !selectedCampaign.isAccepptingCharacters && !values.isNpc) {
          // Check if current user is owner
          // Note: using session.user.email isn't enough for ID check unless we have it.
          // But we can allow if we can verify ownership.
          // We can fetch current user ID.
          try {
            // Optimized: Assuming we might not have user ID handy synchronously correctly without fetching.
            // But let's use the valid check.
            const currentUser = await getCurrentUser();
            if (selectedCampaign.owner?._id !== currentUser?._id) {
              toast.error("Erro", {
                description: "Esta campanha não está aceitando personagens no momento"
              });
              setIsSubmitting(false);
              return;
            }
          } catch (e) {
            // Fallback if auth check fails
            toast.error("Erro", {
              description: "Esta campanha não está aceitando personagens no momento"
            });
            setIsSubmitting(false);
            return;
          }
        }

        const response = await createCharacter({
          name: values.name,
          owner: session?.user?.email || "",
          campaign: values.campaign,
          characterUrl: values.characterUrl || "",
          message: values.message,
          status: values.status,
          isNpc: values.isNpc,
          alignment: values.alignment,
          isVisible: values.isVisible,
        });

        if (response.ok) {
          toast.success("Personagem criado com sucesso!");
          handleClose();
          router.refresh();
        } else {
          toast.error("Erro ao criar personagem");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editId ? "Editar Personagem" : isNpcFromUrl ? "Criar Novo NPC" : "Criar Novo Personagem"}
          </DialogTitle>
          <DialogDescription>
            {editId
              ? "Faça alterações nos dados do personagem."
              : `Preencha os dados para criar ${isNpcFromUrl ? "um NPC" : "um personagem"} para sua campanha.`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando dados...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do personagem" {...field} />
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
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!!editId && !isCreateMode} // Opcional: Bloquear mudança de campanha na edição se desejado
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma campanha" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign._id} value={campaign._id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="characterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="URL da imagem (opcional)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link para imagem do personagem.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alinhamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o alinhamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ally">Aliado</SelectItem>
                          <SelectItem value="enemy">Inimigo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Visibility Toggle - Only for NPCs */}
              {form.watch("isNpc") && (
                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visível para Jogadores</FormLabel>
                        <FormDescription>
                          Se desativado, este personagem será visível apenas para o Mestre.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}


              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição / Mensagem</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="História, descrição ou anotações..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Salvando..."
                    : editId
                      ? "Salvar Alterações"
                      : isNpcFromUrl
                        ? "Criar NPC"
                        : "Criar Personagem"
                  }
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
