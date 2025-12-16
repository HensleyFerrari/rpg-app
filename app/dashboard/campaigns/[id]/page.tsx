import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getBattlesByCampaign } from "@/lib/actions/battle.actions";
import {
  Calendar,
  User,
  Users,
  Swords,
  Shield,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";

const CampaignDetail = async ({ params }: any) => {
  const { id } = params;
  const campaignResponse = await getCampaignById(id);
  const currentUser = await getCurrentUser();
  const battlesResponse = await getBattlesByCampaign(id);

  if (!campaignResponse.ok || !campaignResponse.data) {
    notFound();
  }

  const campaign = campaignResponse.data;
  const battles = battlesResponse.ok ? battlesResponse.data : [];
  const formattedDate = campaign.createdAt
    ? new Date(campaign.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data desconhecida";

  const isOwner = currentUser?._id.toString() === campaign.owner?._id;

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Campanhas", href: "/dashboard/campaigns" },
              { label: campaign.name },
            ]}
          />

          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/personagens/new?campaign=${campaign._id}`}>
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Novo Personagem
              </Button>
            </Link>
            {isOwner && (
              <>
                <Link href={`/dashboard/campaigns/${id}/manage`}>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Gerenciar Personagens
                  </Button>
                </Link>
                <Link href={`/dashboard/campaigns/${id}/edit`}>
                  <Button variant="default" className="gap-2">
                    Editar Campanha
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {campaign.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm mt-2">
                    <Calendar className="h-4 w-4" /> Criada em {formattedDate}
                  </CardDescription>
                </div>
                {campaign.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-xl font-semibold mb-4">Descrição</h3>
                  {campaign.description ? (
                    <p className="text-muted-foreground">
                      <ReadOnlyRichTextViewer content={campaign.description} />
                    </p>
                  ) : (
                    <p className="text-muted-foreground/60 italic">
                      Esta campanha não possui uma descrição.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Battles Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Batalhas
                  </CardTitle>
                  {isOwner && (
                    <Link
                      href={`/dashboard/battles/newBattle?campaign=${campaign._id}`}
                    >
                      <Button variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4" />
                        Nova Batalha
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {battles && battles.length > 0 ? (
                  <div className="space-y-2">
                    {battles.map((battle: any) => (
                      <Link
                        key={battle._id}
                        href={`/dashboard/battles/${battle._id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{battle.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Round {battle.round}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={battle.active ? "default" : "secondary"}
                          >
                            {battle.active ? "Em andamento" : "Finalizada"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-center py-4">
                    Nenhuma batalha foi criada para esta campanha ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Mestre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {campaign.owner?.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                      <Image
                        src={campaign.owner.avatarUrl}
                        alt={campaign.owner?.name || "Mestre"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {campaign.owner?.name ||
                        campaign.owner?.username ||
                        "Mestre"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mestre da campanha
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Personagens
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {campaign.characters.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {campaign.characters.length > 0 ? (
                  <div className="divide-y">
                    {campaign.characters.map((character: any) => (
                      <Link
                        key={character._id}
                        href={`/dashboard/personagens/${character._id}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                      >
                        {character.characterUrl ? (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={character.characterUrl}
                              alt={character.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {character.name}
                          </p>
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
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-muted-foreground italic">
                      Nenhum personagem adicionado ainda.
                    </p>
                    <Link
                      href={`/dashboard/personagens/new?campaign=${campaign._id}`}
                    >
                      <Button variant="link" className="mt-2">
                        Adicionar personagem
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
