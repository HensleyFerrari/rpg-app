"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { User2, Swords, Edit, Book } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getCharacterById } from "@/lib/actions/character.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CharacterStatusBadge } from "../../../../components/ui/character-status-badge";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";

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

        if (getCharacter && "owner" in getCharacter) {
          const characterData = getCharacter as unknown as Character;
          // Only set isOwner if we have both character and user data
          if (actualUser?._id) {
            setIsOwner(characterData.owner._id === actualUser._id);
          }
          setCharacter(characterData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching character:", error);
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

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
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Personagens", href: "/dashboard/personagens" },
          { label: character.name },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-center mb-4">
                {character.name}
              </h2>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 border-2 border-primary/20 shadow-xl">
                {character.characterUrl ? (
                  <Image
                    src={character.characterUrl}
                    alt={character.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User2 className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
              <CharacterStatusBadge status={character.status} />

              {/* Quick Stats */}
              <div className="w-full grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Swords className="w-5 h-5" />
                    {character.battles?.length || 0}
                  </p>
                  <p className="text-sm">Batalhas</p>
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
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" /> Editar Personagem
                        </Button>
                      </Link>
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
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User2 className="w-5 h-5" /> Biografia
                  </h3>
                  <div className="prose dark:prose-invert max-w-none" />
                  <ReadOnlyRichTextViewer content={character.message} />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Book className="w-5 h-5" /> Campanha
                  </h3>
                  <p>{character.campaign.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
