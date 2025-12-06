"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createFeedback } from "@/lib/actions/feedback.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedbackForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const values = {
      title: formData.get("title") as string,
      description: description,
      type: formData.get("type") as string,
      area: formData.get("area") as string,
    };

    try {
      const response = await createFeedback(values);

      if (response.ok) {
        toast.success(response.message);
        (e.target as HTMLFormElement).reset();
        setDescription("");
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error: Error | unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar feedback"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Digite o título do seu feedback"
              required
            />
          </div>
          <Label htmlFor="type">Tipo de Feedback</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug/Problema</SelectItem>
              <SelectItem value="feature">
                Sugestão de Funcionalidade
              </SelectItem>
              <SelectItem value="improvement">Melhoria</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Área da Aplicação</Label>
          <Select name="area" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a área da aplicação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Geral</SelectItem>
              <SelectItem value="campanhas">Campanhas</SelectItem>
              <SelectItem value="personagens">Personagens</SelectItem>
              <SelectItem value="batalhas">Batalhas</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Descreva seu feedback em detalhes"
            className="min-h-[150px]"
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar Feedback"}
        </Button>
      </form>
    </Card>
  );
}
