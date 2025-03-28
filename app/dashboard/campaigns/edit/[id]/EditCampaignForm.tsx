"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCampaign } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
};

const EditCampaignForm = ({ campaign }: any) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: campaign.name || "",
      description: campaign.description || "",
      imageUrl: campaign.imageUrl || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.email) {
      toast.error("Erro", {
        description: "Você precisa estar logado para editar uma campanha",
      });
      return;
    }

    // Check if user is the owner of the campaign
    if (campaign.owner.email !== session.user.email) {
      toast.error("Erro", {
        description: "Você não tem permissão para editar esta campanha",
      });
      return;
    }

    try {
      setIsLoading(true);

      const result = await updateCampaign(campaign._id, {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      });

      if (result.ok) {
        toast.success("Sucesso!", {
          description: "Campanha atualizada com sucesso",
        });
        router.push("/dashboard/campaigns");
      } else {
        toast.error("Erro", {
          description:
            result.message || "Ocorreu um erro ao atualizar a campanha",
        });
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao atualizar a campanha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Campanha</CardTitle>
        <CardDescription>
          Atualize os detalhes da sua campanha de RPG.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
            <Textarea
              id="description"
              placeholder="Descreva sua campanha"
              className="min-h-[100px]"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              placeholder="https://exemplo.com/imagem.jpg"
              {...register("imageUrl")}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between mt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditCampaignForm;
