"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  getCharacterById,
  updateCharacter,
} from "@/lib/actions/character.actions";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  characterUrl: z
    .string()
    .url({
      message: "Insira uma URL válida.",
    })
    .optional()
    .or(z.literal("")),
  message: z.string().optional(),
  status: z.enum(["alive", "dead"], {
    required_error: "Selecione um status.",
  }),
});

const CharacterEdit = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      characterUrl: "",
      message: "",
      status: "alive",
    },
  });

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await getCharacterById(id as string);

        if (response.ok && response.data) {
          const character = response.data as any;
          form.reset({
            name: character.name,
            characterUrl: character.characterUrl || "",
            message: character.message || "",
            status: character.status,
          });
        } else {
          toast.error("Personagem não encontrado");
          router.push("/dashboard/personagens");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch character:", err);
        setIsLoading(false);
        toast.error("Erro ao carregar personagem");
      }
    };

    fetchCharacter();
  }, [id, form, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await updateCharacter(id as string, values);

      if (response?.ok) {
        toast.success("Personagem atualizado com sucesso!");
        router.push(`/dashboard/personagens/${id}`);
      } else {
        toast.error(response?.message || "Erro ao atualizar personagem");
      }
    } catch (err) {
      console.error("Error updating character:", err);
      toast.error("Erro ao atualizar personagem");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Personagens", href: "/dashboard/personagens" },
          {
            label: form.getValues("name") || "Personagem",
            href: `/dashboard/personagens/${id}`,
          },
          { label: "Editar" },
        ]}
      />
      <CardHeader>
        <CardTitle>Editar Personagem</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do personagem" />
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
              name="characterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da imagem</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem do personagem (opcional).
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
                      {...field}
                      placeholder="Descrição do personagem"
                      className="resize-none"
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CharacterEdit;
