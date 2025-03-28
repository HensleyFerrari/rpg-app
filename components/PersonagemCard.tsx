import Image from "next/image";
import Link from "next/link";

type Personagem = {
  id: string;
  nome: string;
  classe: string;
  nivel: number;
  raca: string;
  imageUrl?: string;
};

interface PersonagemCardProps {
  personagem: Personagem;
}

export default function PersonagemCard({ personagem }: PersonagemCardProps) {
  return (
    <Link href={`/dashboard/personagens/${personagem.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 w-full">
          {personagem.imageUrl ? (
            <Image
              src={personagem.imageUrl}
              alt={personagem.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-4xl text-gray-500">🧙</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold mb-1">{personagem.nome}</h3>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{personagem.raca}</span>
            <span>{personagem.classe}</span>
          </div>
          <div className="mt-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full inline-block">
            Nível {personagem.nivel}
          </div>
        </div>
      </div>
    </Link>
  );
}
