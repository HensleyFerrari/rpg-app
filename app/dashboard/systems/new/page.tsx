"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSystem } from "@/lib/actions/system.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSystemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const res = await createSystem({ name, description });
    
    setLoading(false);
    
    if (res.error) {
        toast.error(res.error);
        return;
    }
    
    toast.success("Sistema criado com sucesso!");
    router.push(`/dashboard/systems/${res.data._id}`);
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
        <div className="mb-6">
            <Link href="/dashboard/systems" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Voltar para lista
            </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Criar Novo Sistema</h1>
        <p className="text-muted-foreground mb-8">Defina o nome e descrição do seu sistema de RPG.</p>
        
        <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-xl bg-card">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Sistema</Label>
                <Input id="name" name="name" required placeholder="Ex: D&D 5e Customizado, Call of Cthulhu..." />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Uma breve descrição das regras, cenário ou anotações..." 
                    rows={4}
                />
            </div>
            
            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Criando..." : "Criar Sistema"}
                </Button>
            </div>
        </form>
    </div>
  )
}
