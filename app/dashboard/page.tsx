import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getAllBattlesByUser } from "@/lib/actions/battle.actions";
import { getCharactersByOwner } from "@/lib/actions/character.actions";
import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import Link from "next/link";
import {
  Swords,
  Users,
  Shield,
  ArrowRight,
  Target,
  Crown,
  History,
  Skull,
} from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

const Dashboard = async () => {
  const actualUser = await getCurrentUser();
  const battlesData = await getAllBattlesByUser();
  const charactersData = await getCharactersByOwner();
  const campaignsData = await getMyCampaigns();

  const battles = battlesData.ok ? (battlesData.data as any[]) || [] : [];
  const characters = charactersData.ok ? (charactersData.data as any[]) || [] : [];
  const campaigns = campaignsData.ok ? (campaignsData.data as any[]) || [] : [];

  // Stats calculation
  const totalBattles = battles.length;
  const activeBattles = battles.filter((b) => b.active).length;

  const totalCharacters = characters.length;
  const aliveCharacters = characters.filter((c) => c.status === "alive").length;
  const deadCharacters = characters.filter((c) => c.status === "dead").length;

  const totalCampaigns = campaigns.length;

  // Recent Activity
  const recentBattles = [...battles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const recentCharacters = [...characters]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Olá, {actualUser?.name?.split(' ')[0] || "Viajante"}
        </h2>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de comando. Aqui você pode gerenciar suas aventuras, batalhas e heróis.
        </p>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-dashed border-2 hover:border-solid transition-all"
          asChild
        >
          <Link href="/dashboard/battles?action=new-battle">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2">
              <Swords className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold">Nova Batalha</span>
            <span className="text-xs text-muted-foreground font-normal">Inicie um combate</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-dashed border-2 hover:border-solid transition-all"
          asChild
        >
          <Link href="/dashboard/personagens?new=true">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold">Novo Personagem</span>
            <span className="text-xs text-muted-foreground font-normal">Crie um herói ou NPC</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-dashed border-2 hover:border-solid transition-all"
          asChild
        >
          <Link href="/dashboard/campaigns/createCampaign">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-semibold">Nova Campanha</span>
            <span className="text-xs text-muted-foreground font-normal">Comece uma história</span>
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Batalhas
            </CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBattles}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                {activeBattles} ativas
              </span>
              <span className="text-xs text-muted-foreground">
                no total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personagens
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCharacters}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Target className="h-3 w-3" /> {aliveCharacters}
              </span>
              <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Skull className="h-3 w-3" /> {deadCharacters}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campanhas
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mundos criados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Battles */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Batalhas Recentes
            </CardTitle>
            <CardDescription>
              Seus últimos confrontos e combates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {recentBattles.length > 0 ? (
              <div className="space-y-4">
                {recentBattles.map((battle) => (
                  <div key={battle._id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {battle.campaign?.imageUrl ? (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                            <Image
                              src={battle.campaign.imageUrl}
                              alt="Campaign"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <Swords className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{battle.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {battle.campaign?.name || "Sem campanha"} • Round {battle.round}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/battles/${battle._id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Swords className="h-8 w-8 mb-2 opacity-50" />
                <p>Nenhuma batalha recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Characters */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personagens Recentes
            </CardTitle>
            <CardDescription>
              Últimos heróis e NPCs adicionados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {recentCharacters.length > 0 ? (
              <div className="space-y-4">
                {recentCharacters.map((char) => (
                  <div key={char._id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {char.characterUrl ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={char.characterUrl}
                              alt={char.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <Shield className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{char.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {char.isNpc ? "NPC" : "Personagem"} • {char.status === "alive" ? "Vivo" : "Morto"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/personagens/${char._id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p>Nenhum personagem recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
