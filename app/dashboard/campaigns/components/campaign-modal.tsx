"use client";

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
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createCampaign, updateCampaign, getCampaignById } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
  isAcepptingCharacters: boolean;
};

export function CampaignModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isNew = searchParams.get("new") === "true";
  const editId = searchParams.get("edit");
  const isOpen = isNew || !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      isAcepptingCharacters: true,
    },
  });

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("edit");
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  // Reset or Fetch data when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (isNew) {
        reset({
          name: "",
          description: "",
          imageUrl: "",
          isAcepptingCharacters: true,
        });
      } else if (editId) {
        setIsFetching(true);
        try {
          const result = await getCampaignById(editId);
          if (result.ok && result.data) {
            const campaign = Array.isArray(result.data) ? result.data[0] : result.data;
            reset({
              name: campaign.name || "",
              description: campaign.description || "",
              imageUrl: campaign.imageUrl || "",
              isAcepptingCharacters: Boolean(campaign.isAcepptingCharacters),
            });
          } else {
            toast.error("Erro ao carregar campanha");
            handleClose();
          }
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar campanha");
          handleClose();
        } finally {
          setIsFetching(false);
        }
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, isNew, editId, reset, handleClose]);

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.email) {
      toast.error("Erro", {
        description: "Você precisa estar logado.",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isNew) {
        const result = await createCampaign({
          name: data.name,
          email: session.user.email,
          description: data.description,
          imageUrl: data.imageUrl,
        });

        if (result.ok) {
          toast.success("Sucesso!", { description: result.message });
          handleClose();
          router.refresh();
        } else {
          toast.error("Erro", { description: result.message });
        }
      } else if (editId) {
        const result = await updateCampaign(editId, {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          isAcepptingCharacters: data.isAcepptingCharacters
        });

        if (result.ok) {
          toast.success("Sucesso!", { description: "Campanha atualizada." });
          handleClose();
          router.refresh();
        } else {
          toast.error("Erro", { description: result.message });
        }
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao salvar a campanha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isNew ? "Criar Nova Campanha" : "Editar Campanha"}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "Preencha os detalhes abaixo para criar sua nova campanha de RPG."
              : "Atualize os detalhes da sua campanha."}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Carregando dados...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                placeholder="Ex: A Masmorra do Dragão Negro"
                {...register("name", {
                  required: "O nome da campanha é obrigatório",
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Descreva sua campanha..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                placeholder="https://exemplo.com/imagem.jpg"
                {...register("imageUrl")}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>

            {/* Only show acceptance toggle on edit, or maybe on create too? Usually create is true by default */}
            {/* The create action doesn't seem to take isAcepptingCharacters in the helper, but update does. 
                  Let's check createCampaign signature in createCampaign/page.tsx:
                  It calls createCampaign({ name, email, description, imageUrl }).
                  So looks like create doesn't support setting this initially or it defaults to true on server.
                  We'll only show this field if editing or verify if createCampaign supports it.
                  Assuming create defaults to true and we can't change it during creation easily without checking server action.
                  For now, let's include it for edit only to be safe, or just visual if new. 
              */}
            {editId && (
              <div className="flex items-center justify-between border p-3 rounded-md">
                <Label htmlFor="isAcepptingCharacters">
                  Aceitando novos personagens
                </Label>
                <Controller
                  control={control}
                  name="isAcepptingCharacters"
                  render={({ field }) => (
                    <Switch
                      id="isAcepptingCharacters"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : (isNew ? "Criar Campanha" : "Salvar Alterações")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
