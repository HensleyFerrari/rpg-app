import { getAllCharacters } from "@/lib/actions/character.actions";
import PersonagemCard from "@/components/PersonagemCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Personagens() {
  const response = await getAllCharacters();
  const personagens = response.ok ? (response.data as any[]) || [] : [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Todos os Personagens</h1>
        <Link href="/dashboard/personagens/new">
          <Button>Criar Personagem</Button>
        </Link>
      </div>

      {!response.ok ? (
        <div className="text-center py-10">
          <p className="text-red-500">
            Erro ao carregar personagens: {response.message}
          </p>
        </div>
      ) : personagens.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum personagem encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personagens.map((personagem) => (
            <PersonagemCard key={personagem._id} personagem={personagem} />
          ))}
        </div>
      )}
    </div>
  );
}
