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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface CampaignDetailProps {
  params: {
    id: string;
  };
}

const CampaignDetail = async ({ params }: CampaignDetailProps) => {
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
    <div className="container mx-auto py-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Campanhas", href: "/dashboard/campaigns" },
          { label: campaign.name },
        ]}
      />
      <div className="mb-8 flex justify-between items-center">
        {isOwner && (
          <Link href={`/dashboard/campaigns/${id}/edit`}>
            <Button variant="default">Editar campanha</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {campaign.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" /> Criada em {formattedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.imageUrl && (
                <div className="relative w-full h-[300px] mb-6 rounded-md overflow-hidden">
                  <Image
                    src={campaign.imageUrl}
                    alt={campaign.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-semibold mb-4">Descrição</h3>
                {campaign.description ? (
                  <p>{campaign.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Esta campanha não possui uma descrição.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Batalhas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {battles && battles.length > 0 ? (
                <div className="space-y-4">
                  {battles.map((battle) => (
                    <Link
                      key={battle._id}
                      href={`/dashboard/battles/${battle._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{battle.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Round {battle.round}
                          </p>
                        </div>
                      </div>
                      <Badge variant={battle.active ? "default" : "secondary"}>
                        {battle.active ? "Em andamento" : "Finalizada"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
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
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
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
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl font-semibold">Personagens</span>
                <span className="text-sm bg-muted rounded-full px-2 py-1">
                  {campaign.characters.length || 0}{" "}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.characters.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {campaign.characters.map((character) => (
                    <Link
                      key={character._id}
                      href="#"
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/10"
                    >
                      {character.characterUrl ? (
                        <Image
                          src={character.characterUrl}
                          alt={character.name}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">{character.name}</p>
                        <Badge
                          variant={
                            character.status === "alive"
                              ? "default"
                              : "destructive"
                          }
                          className="text-sm"
                        >
                          {character.status === "alive" ? "Vivo" : "Morto"}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {character.owner?.name ||
                            character.owner?.username ||
                            "Jogador"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Nenhum personagem adicionado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 gap-2 flex flex-col">
              <Link
                href={`/dashboard/personagens/new?campaign=${campaign._id}`}
              >
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar personagem
                </Button>
              </Link>
              {isOwner && (
                <Link
                  href={`/dashboard/battles/newBattle?campaign=${campaign._id}`}
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Swords className="h-4 w-4 mr-2" />
                    Criar batalha
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
