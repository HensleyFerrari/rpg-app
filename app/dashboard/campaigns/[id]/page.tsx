import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getBattlesByCampaign } from "@/lib/actions/battle.actions";
import {
  User,
  Users,
  Swords,
  Shield,
  PlusCircle,
  ChevronRight,
  Clock,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";
import { CharacterList } from "./_components/character-list";
import { CampaignModal } from "../components/campaign-modal";

const CampaignDetail = async ({ params }: any) => {
  const { id } = await params;
  const [campaignResponse, currentUser, battlesResponse] = await Promise.all([
    getCampaignById(id),
    getCurrentUser(),
    getBattlesByCampaign(id),
  ]);

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
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in duration-500">
      <CampaignModal />

      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{campaign.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">ID:</span> #{campaign._id.toString().slice(-4)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Link href={`?edit=${id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b">
            <TabsList className="flex h-auto w-full justify-start gap-6 bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="characters"
                className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
              >
                Personagens
              </TabsTrigger>
              <TabsTrigger
                value="npcs"
                className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
              >
                NPCs
              </TabsTrigger>
              <TabsTrigger
                value="battles"
                className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-purple-500 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground hover:text-purple-500"
              >
                Batalhas ({battles.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-8">
            <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-10">
                  {campaign.imageUrl && (
                    <div className="space-y-4 pt-4">
                      <h3 className="font-semibold text-lg tracking-tight">Preview</h3>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted/30">
                        <Image
                          src={campaign.imageUrl}
                          alt={campaign.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {campaign.description && (
                        <div className="prose max-w-none dark:prose-invert text-muted-foreground">
                          <ReadOnlyRichTextViewer content={campaign.description} />
                        </div>
                      ) || "Nenhuma descrição fornecida."}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mestre</h3>
                    <div className="flex items-center gap-3">
                      {campaign.owner?.avatarUrl ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                          <Image
                            src={campaign.owner.avatarUrl}
                            alt={campaign.owner?.name || "Mestre"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {campaign.owner?.name || campaign.owner?.username || "Mestre"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex flex-col gap-3">
                      {campaign.isAccepptingCharacters && (
                        <Link href={`?action=new-character&campaign=${campaign._id}`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                            <PlusCircle className="h-4 w-4" />
                            Adicionar Personagem
                          </Button>
                        </Link>
                      )}
                      {isOwner && (
                        <Link href={`?action=new-character&campaign=${campaign._id}&isNpc=true`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                            <PlusCircle className="h-4 w-4" />
                            Adicionar NPC
                          </Button>
                        </Link>
                      )}
                      {isOwner && (
                        <Link href={`/dashboard/campaigns/${id}/manage`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                            <Users className="h-4 w-4" />
                            Gerenciar Membros
                          </Button>
                        </Link>
                      )}
                      {isOwner && (
                        <Link href={`?action=new-battle&campaign=${campaign._id}`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                            <Swords className="h-4 w-4" />
                            Criar Batalha
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="characters" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Personagens ativos</h3>
                  <p className="text-sm text-muted-foreground">Gerencie personagens da campanha.</p>
                </div>
              </div>
              <CharacterList
                characters={characters}
                isOwner={isOwner}
                campaignId={campaign._id}
                isNpc={false}
                isAcceptingCharacters={campaign.isAccepptingCharacters}
              />
            </TabsContent>

            <TabsContent value="npcs" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">NPCs</h3>
                  <p className="text-sm text-muted-foreground">Personagens não-jogadores e entidades.</p>
                </div>
                {isOwner && (
                  <Link href={`?action=new-character&campaign=${campaign._id}&isNpc=true`}>
                    <Button size="sm" className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Adicionar NPC
                    </Button>
                  </Link>
                )}
              </div>
              <CharacterList
                characters={npcs}
                isOwner={isOwner}
                campaignId={campaign._id}
                isNpc={true}
                isAcceptingCharacters={campaign.isAccepptingCharacters}
              />
            </TabsContent>

            <TabsContent value="battles" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Batalhas</h3>
                  <p className="text-sm text-muted-foreground">Encontros e cenários táticos.</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Lista de Batalhas</span>
                  <span className="text-xs text-muted-foreground">{battles.length} batalhas</span>
                </div>
                {battles && battles.length > 0 ? (
                  <div className="divide-y">
                    {battles.map((battle: any) => (
                      <Link
                        key={battle._id}
                        href={`/dashboard/battles/${battle._id}`}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{battle.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Round {battle.round} • {battle.active ? "Em andamento" : "Concluída"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma batalha registrada ainda.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* <TabsContent value="assets" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">No assets yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Upload maps, handouts, and other resources for your campaign here.
                </p>
                <Button variant="outline" className="mt-6" disabled>
                  Upload File (Coming Soon)
                </Button>
              </div>
            </TabsContent> */}
          </div>
        </Tabs>
      </div>
    </div>
  );
};


export default CampaignDetail;
