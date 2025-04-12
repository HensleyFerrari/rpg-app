"use client";

import { useParams, useRouter } from "next/navigation";
import { updateBattle, getBattleById } from "@/lib/actions/battle.actions";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const EditBattle = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    round: 1,
    active: false,
  });

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const { data: battleData } = await getBattleById(id as string);
        setFormData({
          name: battleData.name,
          round: battleData.round,
          active: battleData.active,
        });
      } catch (error) {
        toast.error("Error fetching battle data", {
          description: "Failed to load battle data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBattle();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedBattle = await updateBattle(id, formData);
      if (!updatedBattle.ok) {
        toast.error("Error", {
          description: updatedBattle.message,
        });
        return;
      }
      toast.success("Sucesso", {
        description: "A batalha foi atualizada com sucesso",
      });

      router.push(`/dashboard/battles/${id}`);
    } catch (error) {
      toast("Error", {
        description: "Failed to update battle",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Batalhas", href: "/dashboard/battles" },
          { label: formData.name, href: `/dashboard/battles/${id}` },
          { label: "Editar" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">Editar batalha</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da batalha</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="name">Nome da batalha</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter battle name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="round">Round Atual</Label>
                <Input
                  id="round"
                  name="round"
                  type="number"
                  min="1"
                  value={formData.round}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="active">Stauts da batalha</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <span>{formData.active ? "Ativa" : "Inativa"}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditBattle;
