"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  User2,
  Swords,
  Edit,
  Book,
  Calendar,
  Trash2,
  Clock,
  User,
  Shield,
  Zap,
  BarChart3,
  Heart,
  ArrowRight
} from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getCharacterById, deleteCharacter } from "@/lib/actions/character.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CharacterStatusBadge } from "@/components/ui/character-status-badge";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CharacterModal } from "../_components/character-modal";
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


// Character type definition
type Character = {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
    username: string;
  };
  campaign: {
    _id: string;
    name: string;
    owner: {
      _id: string;
      name: string;
      username: string;
    };
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
  isNpc: boolean;
  alignment: "ally" | "enemy";
  damages?: Array<{
    _id: string;
    damage: number;
    type: "damage" | "heal";
    isCritical: boolean;
  }>;
};

const CharacterPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const { data: getCharacter } = await getCharacterById(id);
        const actualUser = await getCurrentUser();

        if (getCharacter && "owner" in getCharacter) {
          const characterData = getCharacter as unknown as Character;
          if (actualUser?._id) {
            const isCharacterOwner = characterData.owner._id === actualUser._id;
            const isCampaignOwner = characterData.campaign.owner._id === actualUser._id;
            setHasEditPermission(isCharacterOwner || isCampaignOwner);
          }
          setCharacter(characterData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching character:", error);
        setLoading(false);
        toast.error("Erro ao carregar personagem");
      }
    };

    fetchCharacter();
  }, [id, searchParams]);

  const handleDelete = async () => {
    try {
      const response = await deleteCharacter(id);
      if (response.ok) {
        toast.success("Personagem excluído com sucesso");
        router.push("/dashboard/personagens");
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err)
      toast.error("Erro ao excluir personagem");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-4 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] md:col-span-1" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold">Personagem não encontrado</h1>
        <p className="text-muted-foreground">Não foi possível encontrar os detalhes deste personagem.</p>
        <Link href="/dashboard/personagens">
          <Button variant="outline">Voltar para lista</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Personagens", href: "/dashboard/personagens" },
            { label: character.name },
          ]}
        />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              {character.name}
              {character.isNpc && (
                <Badge variant="outline" className="text-xs uppercase px-2 py-0 border-primary/30 text-primary">NPC</Badge>
              )}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono text-xs">ID: #{character._id.slice(-6)}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Criado em {formatDate(character.createdAt)}
              </span>
            </div>
          </div>

          {hasEditPermission && (
            <div className="flex items-center gap-2">
              <Link href={`?editCharacter=${id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 mb-8">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent transition-all shadow-none"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent transition-all shadow-none"
          >
            Estatísticas
          </TabsTrigger>
          <TabsTrigger
            value="battles"
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent transition-all shadow-none"
          >
            Batalhas <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">{character.battles?.length || 0}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">História</h3>
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm aspect-video relative group">
                  <CharacterAvatar
                    src={character.characterUrl}
                    alt={character.name}
                    isNpc={character.isNpc}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    autoHeight
                  />
                  <div className="absolute top-4 left-4">
                    <CharacterStatusBadge status={character.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {character.message ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReadOnlyRichTextViewer content={character.message} />
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma descrição fornecida.</p>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Criador</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(character.owner.name || character.owner.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{character.owner.name || character.owner.username}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Campaign Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Campanha</h3>
                <Link href={`/dashboard/campaigns/${character.campaign._id}`} className="block group">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/50 transition-all">
                    <span className="font-medium truncate">{character.campaign.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </div>

              <Separator />

              {/* Character Details Sidebar */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metadados</h3>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Alinhamento</span>
                    <span className="capitalize font-medium">{character.alignment === 'ally' ? 'Aliado' : character.alignment === 'enemy' ? 'Inimigo' : 'Neutro'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Swords className="w-4 h-4" /> Batalhas</span>
                    <span className="font-medium">{character.battles?.length || 0}</span>
                  </div>
                </div>
              </div>

              {hasEditPermission && (
                <div className="pt-4 flex flex-col gap-2">
                  <Link href={`?editCharacter=${id}`}>
                    <Button variant="outline" className="w-full justify-start gap-2 h-10">
                      <Edit className="w-4 h-4" /> Editar Personagem
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 h-10 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                        <Trash2 className="w-4 h-4" /> Excluir Personagem
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente o personagem
                          <span className="font-semibold text-foreground"> {character.name} </span>
                          e removerá todos os dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

            </div>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          {character.damages && character.damages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <Swords className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mt-2">Dano Total Causado</h3>
                  <p className="text-3xl font-bold">
                    {character.damages
                      .filter(d => d.type !== 'heal')
                      .reduce((acc, curr) => acc + curr.damage, 0)
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Heart className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mt-2">Cura Total Realizada</h3>
                  <p className="text-3xl font-bold text-green-500">
                    {character.damages
                      .filter(d => d.type === 'heal')
                      .reduce((acc, curr) => acc + curr.damage, 0)
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-amber-500/10 rounded-full">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mt-2">Maior Dano/Cura</h3>
                  <p className="text-3xl font-bold">
                    {Math.max(...character.damages.map(d => d.damage))}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mt-2">Média por Ação</h3>
                  <p className="text-3xl font-bold">
                    {(character.damages.reduce((acc, curr) => acc + curr.damage, 0) / character.damages.length).toFixed(1)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <div className="bg-muted p-4 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                Sem dados estatísticos
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Este personagem ainda não realizou ações em batalha.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="battles" className="space-y-4">
          {character.battles && character.battles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {character.battles.map((battle) => (
                <Link href={`/dashboard/battles/${battle._id}`} key={battle._id}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Swords className="h-4 w-4 text-muted-foreground" />
                        {battle.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Clique para ver detalhes desta batalha.</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Swords className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                Nenhuma batalha encontrada
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Este personagem ainda não participou de nenhuma batalha.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <CharacterModal />
    </div>
  );
};

export default CharacterPage;
