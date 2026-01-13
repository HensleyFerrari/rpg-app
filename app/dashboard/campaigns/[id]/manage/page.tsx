"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { deleteCharacter } from "@/lib/actions/character.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ManageCampaign() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data: campaignData } = await getCampaignById(id as string);
        const actualUser = await getCurrentUser();

        if (campaignData && actualUser) {
          setCampaign(campaignData);
          setIsOwner(campaignData.owner._id === actualUser._id);
        }
      } catch (error) {
        console.log(error);
        toast.error("Erro ao carregar campanha");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const response = await deleteCharacter(characterId);
      if (response.ok) {
        toast.success("Personagem removido com sucesso");
        // Atualiza a lista de personagens
        const { data: updatedCampaign } = await getCampaignById(id as string);
        setCampaign(updatedCampaign);
      } else {
        toast.error("Erro ao remover personagem");
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao remover personagem");
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!campaign || !isOwner) {
    return <div>Acesso negado</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Campanhas", href: "/dashboard/campaigns" },
              {
                label: campaign.name,
                href: `/dashboard/campaigns/${campaign._id}`,
              },
              { label: "Gerenciar Personagens" },
            ]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Gerenciar Personagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.characters.length > 0 ? (
              <div className="divide-y">
                {campaign.characters.map((character: any) => (
                  <div
                    key={character._id}
                    className="flex items-center justify-between p-4"
                  >
                    <Link
                      href={`/dashboard/personagens/${character._id}`}
                      className="flex items-center gap-3 flex-1"
                    >
                      <CharacterAvatar character={character} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{character.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              character.status === "alive"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {character.status === "alive" ? "Vivo" : "Morto"}
                          </Badge>
                          <p className="text-sm text-muted-foreground truncate">
                            {character.owner?.name ||
                              character.owner?.username ||
                              "Jogador"}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remover Personagem
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este personagem da
                            campanha? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCharacter(character._id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Nenhum personagem na campanha
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CharacterAvatar({ character }: { character: any }) {
  const [error, setError] = useState(false);

  if (character.characterUrl && !error) {
    return (
      <div className="relative w-12 h-12 rounded-md overflow-hidden">
        <Image
          src={character.characterUrl}
          alt={character.name}
          fill
          className="object-cover"
          unoptimized
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
      <Users className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}
