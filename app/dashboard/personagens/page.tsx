import { getPersonagens } from "@/lib/personagem";
import PersonagemCard from "@/components/PersonagemCard";

export default async function Personagens() {
  const personagens = await getPersonagens();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Personagens</h1>

      {personagens.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum personagem encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personagens.map((personagem) => (
            <PersonagemCard key={personagem.id} personagem={personagem} />
          ))}
        </div>
      )}
    </div>
  );
}
