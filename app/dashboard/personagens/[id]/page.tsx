"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getCharacterById } from "@/lib/actions/character.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Character type definition
type Character = {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
  };
  campaign: {
    _id: string;
    name: string;
  };
  characterUrl: string;
  message: string;
  status: "alive" | "dead" | "unknown";
  battles: Array<{
    _id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

const CharacterPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const { data: getCharacter } = await getCharacterById(id);
        const actualUser = await getCurrentUser();

        if (getCharacter && "owner" in getCharacter && actualUser) {
          const characterData = getCharacter as unknown as Character;
          const isOwner = characterData.owner._id === actualUser._id;
          setIsOwner(isOwner);
          setCharacter(characterData);
        }
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
        return "bg-purple-700";
      case "dead":
        return "bg-red-700";
      default:
        return "bg-gray-700";
    }
  };

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
    <div className="container mx-auto p-4 space-y-6">
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
                )} text-white mb-2 font-bold`}
              >
                {character.status === "alive"
                  ? "Vivo"
                  : character.status === "dead"
                  ? "Morto"
                  : "Desconhecido"}
              </Badge>
              <h2 className="text-2xl font-bold text-center mb-4">
                {character.name}
              </h2>

              {/* Quick Stats */}
              <div className="w-full grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold">
                    {character.battles?.length || 0}
                  </p>
                  <p className="text-sm">Batalhas</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm">Dados Rolados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Options Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Opções</span>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/personagens/${id}/edit`}>
                        <Button variant="outline">Editar Personagem</Button>
                      </Link>
                      <Button variant="default">Rolar Dados</Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Details Card */}
            <Card>
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
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Estatísticas de Batalha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vitórias</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Derrotas</span>
                      <span className="font-bold">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dano Total</span>
                      <span className="font-bold">256</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>D20s Rolados</span>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Críticos</span>
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Falhas</span>
                      <span className="font-bold">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conquistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-bold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Raras</span>
                      <span className="font-bold">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comuns</span>
                      <span className="font-bold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
