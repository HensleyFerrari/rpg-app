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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createCampaign } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
};

const CreateCampaign = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.email) {
      toast.error("Erro", {
        description: "Você precisa estar logado para criar uma campanha",
      });
      return;
    }

    try {
      setIsLoading(true);

      const result = await createCampaign({
        name: data.name,
        email: session.user.email,
        description: data.description,
        imageUrl: data.imageUrl,
      });

      if (result.ok) {
        toast.success("Sucesso!", {
          description: result.message,
        });
        router.push("/dashboard/campaigns");
      } else {
        toast.error("Erro", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao criar a campanha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Campanhas", href: "/dashboard/campaigns" },
          { label: "Nova Campanha" },
        ]}
      />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Nova Campanha</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para criar sua nova campanha de RPG.
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
              <RichTextEditor
                value={""}
                onChange={() => {}}
                placeholder="Descreva sua campanha..."
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
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Campanha"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateCampaign;
