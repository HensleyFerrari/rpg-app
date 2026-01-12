import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CharacterList } from "./_components/character-list";

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

  const characters = campaign.characters?.filter((c: any) => !c.isNpc) || [];
  const npcs = campaign.characters?.filter((c: any) => c.isNpc) || [];

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



        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-6">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/50 px-4 py-2"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="characters"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/50 px-4 py-2"
            >
              Personagens ({characters.length})
            </TabsTrigger>
            <TabsTrigger 
              value="npcs"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/50 px-4 py-2"
            >
              NPCs ({npcs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="battles"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/50 px-4 py-2"
            >
              Batalhas ({battles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Same overview content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
              </div>

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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personagens
              </h3>
              {isOwner && (
                <Link href={`/dashboard/personagens/new?campaign=${campaign._id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Novo Personagem
                  </Button>
                </Link>
              )}
            </div>
            <CharacterList 
              characters={characters} 
              isOwner={isOwner} 
              campaignId={campaign._id} 
              isNpc={false}
            />
          </TabsContent>

          <TabsContent value="npcs" className="mt-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-semibold flex items-center gap-2">
                 <Users className="h-5 w-5" />
                 NPCs
               </h3>
               {isOwner && (
                 <Link href={`/dashboard/personagens/new?campaign=${campaign._id}&isNpc=true`}>
                   <Button variant="outline" size="sm" className="gap-2">
                     <PlusCircle className="h-4 w-4" />
                     Novo NPC
                   </Button>
                 </Link>
               )}
             </div>
             <CharacterList 
               characters={npcs} 
               isOwner={isOwner} 
               campaignId={campaign._id} 
               isNpc={true}
             />
          </TabsContent>

          <TabsContent value="battles" className="mt-6">
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
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                             <Shield className="h-4 w-4 text-primary" />
                          </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};


export default CampaignDetail;
