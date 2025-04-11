"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";

// Shadcn UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getCharacterById } from "@/lib/actions/character.actions";

// Character type definition
type Character = {
  _id: { $oid: string };
  name: string;
  owner: { $oid: string };
  campaign: { $oid: string };
  characterUrl: string;
  message: string;
  status: "alive" | "dead" | "unknown";
  battles: any[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
};

const CharacterPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching character data
    // In a real application, replace this with your API call
    const fetchCharacter = async () => {
      try {
        // Mock data for demonstration
        // In real app: const response = await fetch(`/api/characters/${id}`);
        // const data = await response.json();
        const { data: getCharacter } = await getCharacterById(id);

        setCharacter(getCharacter);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch character:", error);
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alive":
        return "bg-green-700";
      case "dead":
        return "bg-red-700";
      default:
        return "bg-gray-700";
    }
  };

  // const formatDate = (dateString: string) => {
  //   return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
  //     locale: ptBR,
  //   });
  // };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Personagem não encontrado</h1>
        <p>Não foi possível encontrar os detalhes deste personagem.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                {character.characterUrl ? (
                  <Image
                    src={character.characterUrl}
                    alt={character.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p>Sem imagem</p>
                  </div>
                )}
              </div>
              <Badge
                className={`${getStatusColor(
                  character.status
                )} text-white mb-2`}
              >
                {character.status === "alive"
                  ? "Vivo"
                  : character.status === "dead"
                  ? "Morto"
                  : "Desconhecido"}
              </Badge>
              <h2 className="text-2xl font-bold text-center">
                {character.name}
              </h2>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Detalhes do Personagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Biografia</h3>
                <p>{character.message}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Campanha</h3>
                <p>{character.campaign.name}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Batalhas</h3>
                <p>
                  {character.battles.length > 0
                    ? `Participou de ${character.battles.length} batalhas`
                    : "Ainda não participou de nenhuma batalha"}
                </p>
              </div>
            </CardContent>
            {/* <CardFooter className="flex flex-col items-start border-t pt-4">
              <p className="text-sm text-gray-500">
                Criado em: {formatDate(character.createdAt.$date)}
              </p>
              <p className="text-sm text-gray-500">
                Última atualização: {formatDate(character.updatedAt.$date)}
              </p>
            </CardFooter> */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
