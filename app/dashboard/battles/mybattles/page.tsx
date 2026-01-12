"use client";

import { useEffect, useState } from "react";
import { getAllBattlesByUser } from "@/lib/actions/battle.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Swords, 
  History, 
  Plus, 
  Calendar, 
  RotateCcw,
  Search,
  Trophy,
  ChevronRight,
  Shield
} from "lucide-react";

interface Battle {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
  };
  campaign: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  active: boolean;
  round: number;
  createdAt: string;
}

const StatCard = ({ title, value, icon: Icon, description, colorClass }: any) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
    <div className={`h-1 w-full ${colorClass}`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
);

const MyBattlesDashboard = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const battlesResponse = await getAllBattlesByUser();
        const user = await getCurrentUser();

        if (battlesResponse.ok && user) {
          setUserName(user.name);
          const userBattles = battlesResponse.data.filter(
            (battle: Battle) => battle.owner._id === user._id
          );
          setBattles(userBattles);
        }
      } catch (error) {
        console.error("Error fetching battles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBattles = battles.filter((battle) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      battle.name?.toLowerCase().includes(searchLower) ||
      battle.campaign?.name?.toLowerCase().includes(searchLower)
    );
  });

  const activeBattles = filteredBattles.filter((battle) => battle.active);
  const inactiveBattles = filteredBattles.filter((battle) => !battle.active);

  // Stats should reflect total battles, not filtered ones
  const totalActive = battles.filter((b) => b.active).length;
  const totalInactive = battles.filter((b) => !b.active).length;

  const BattleList = ({ battles }: { battles: Battle[] }) => (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Table Header - Desktop */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-5">Batalha / Campanha</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-center">Turno</div>
        <div className="col-span-2">Data</div>
        <div className="col-span-2 text-right">Ações</div>
      </div>

      <div className="divide-y divide-border">
        {battles.map((battle) => (
        <div 
          key={battle._id} 
          className="group relative flex flex-col md:grid md:grid-cols-12 gap-4 px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors border-b border-border last:border-0 md:items-center"
        >
          {/* Mobile Specific Header: Image + Name + Status */}
          <div className="flex md:hidden items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-muted">
                {battle.campaign?.imageUrl ? (
                  <Image
                    src={battle.campaign.imageUrl}
                    alt={battle.campaign.name || "Campaign"}
                    fill
                    className="object-cover"
                    unoptimized={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                 <Link href={`/dashboard/battles/${battle._id}`}>
                  <h3 className="text-sm font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">
                    {battle.name || "Sem Nome"}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {battle.campaign?.name || "Sem Campanha"}
                </p>
              </div>
            </div>
             <Badge 
              variant={battle.active ? "default" : "secondary"}
              className={`${battle.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" : "bg-muted text-muted-foreground border-border"} text-[10px] font-medium border px-2 py-0.5 rounded-full flex-shrink-0 h-fit`}
            >
              {battle.active ? "Ativa" : "Finalizada"}
            </Badge>
          </div>

          {/* Desktop: Battle / Campaign */}
          <div className="hidden md:flex col-span-5 items-center gap-4">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-muted">
              {battle.campaign?.imageUrl ? (
                <Image
                  src={battle.campaign.imageUrl}
                  alt={battle.campaign.name || "Campaign"}
                  fill
                  className="object-cover"
                  unoptimized={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-slate-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/dashboard/battles/${battle._id}`}>
                <h3 className="text-sm font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">
                  {battle.name || "Sem Nome"}
                </h3>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {battle.campaign?.name || "Sem Campanha"}
              </p>
            </div>
          </div>

          {/* Desktop Status */}
          <div className="hidden md:block col-span-2">
            <Badge 
              variant={battle.active ? "default" : "secondary"}
              className={`${battle.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" : "bg-muted text-muted-foreground border-border"} text-[10px] sm:text-xs font-medium border px-2 py-0.5 rounded-full`}
            >
              {battle.active ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ativa
                </span>
              ) : "Finalizada"}
            </Badge>
          </div>

          {/* Turn */}
          <div className="flex md:col-span-1 text-sm font-medium text-slate-700 dark:text-slate-200 md:justify-center items-center gap-2 md:w-auto w-full pl-[60px] md:pl-0 -mt-1 md:mt-0">
            <RotateCcw className="h-3.5 w-3.5 text-slate-400 md:hidden" />
            <span className="text-xs md:text-sm">Turno {battle.round || 0}</span>
          </div>

          {/* Date */}
          <div className="flex md:col-span-2 text-sm text-slate-500 dark:text-slate-400 items-center gap-2 md:w-auto w-full pl-[60px] md:pl-0 -mt-1 md:mt-0">
            <Calendar className="h-3.5 w-3.5 text-slate-400 md:hidden" />
            <span className="text-xs md:text-sm">
              {battle.createdAt
                ? new Date(battle.createdAt).toLocaleDateString('pt-BR')
                : "--/--/----"}
            </span>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex flex-row md:justify-end items-center gap-2 w-full md:w-auto mt-3 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
            <Button variant="outline" size="sm" className="h-8 text-xs px-3 rounded-lg flex-1 md:flex-none" asChild>
              <Link href={`/dashboard/battles/${battle._id}`}>Painel</Link>
            </Button>
            <Button variant="default" size="sm" className="h-8 text-xs px-3 bg-primary hover:bg-primary/90 rounded-lg shadow-sm flex-1 md:flex-none" asChild>
              <Link href={`/dashboard/battles/${battle._id}/edit`}>Gerenciar</Link>
            </Button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Minhas Batalhas
          </h1>
          <p className="text-muted-foreground">
            Batalhas criadas por você, {userName}.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" asChild>
          <Link href="/dashboard/battles/newBattle" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Batalha
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Minhas Batalhas" 
          value={battles.length} 
          icon={History}
          description="Total sob seu comando"
          colorClass="bg-slate-400"
        />
        <StatCard 
          title="Em Andamento" 
          value={totalActive} 
          icon={Swords}
          description="Sessões ativas no momento"
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Taxa de Conclusão" 
          value={battles.length > 0 ? `${Math.round((totalInactive / battles.length) * 100)}%` : "0%"} 
          icon={Trophy}
          description="Batalhas que você finalizou"
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="active" className="px-6 data-[state=active]:bg-card shadow-sm">
                Ativas ({activeBattles.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="px-6 data-[state=active]:bg-card shadow-sm">
                Arquivadas ({inactiveBattles.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar suas batalhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-0 outline-none">
            {activeBattles.length > 0 ? (
              <BattleList battles={activeBattles} />
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
                    <Swords className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {searchTerm ? "Nenhuma batalha encontrada" : "Sem combates ativos"}
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                    {searchTerm 
                      ? "Tente buscar com outros termos." 
                      : "Você não tem nenhuma batalha em andamento. Que tal preparar o próximo encontro?"}
                  </p>
                  {!searchTerm && (
                    <Button variant="outline" className="mt-6 rounded-lg" asChild>
                      <Link href="/dashboard/battles/newBattle">Criar Batalha</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="mt-0 outline-none">
            {inactiveBattles.length > 0 ? (
              <BattleList battles={inactiveBattles} />
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                    <History className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {searchTerm ? "Nenhuma batalha encontrada" : "Sem histórico"}
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                    {searchTerm
                      ? "Tente buscar com outros termos."
                      : "Nenhuma de suas batalhas foi finalizada ainda."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBattlesDashboard;
