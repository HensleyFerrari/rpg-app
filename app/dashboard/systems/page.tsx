import { Button } from "@/components/ui/button";
import { getUserSystems } from "@/lib/actions/system.actions";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function SystemsPage() {
  const systems = await getUserSystems();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meus Sistemas RPG</h1>
        <Link href="/dashboard/systems/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Sistema
          </Button>
        </Link>
      </div>

      {systems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground mb-4">
            Você não tem nenhum sistema criado.
          </p>
          <Link href="/dashboard/systems/new">
            <Button>Criar Primeiro Sistema</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system: any) => (
            <Card key={system._id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>{system.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {system.description || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-4 flex justify-end gap-2">
                 <Link href={`/dashboard/systems/${system._id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                        <Settings className="w-4 h-4"/>
                        Editar Estrutura
                    </Button>
                 </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
