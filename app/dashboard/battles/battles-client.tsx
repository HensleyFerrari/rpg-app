"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Swords, 
  History, 
  Plus, 
  Calendar, 
  User, 
  RotateCcw,
  LayoutDashboard,
  Search,
  Trophy,
  ChevronRight,
  Shield
} from "lucide-react";
import ChangeRound from "./[id]/components/changeRound";

const StatCard = ({ title, value, icon: Icon, description, colorClass }: any) => (
  <Card className="overflow-hidden border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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

const BattleList = ({ battles, currentUser }: { battles: any[], currentUser: any }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
    {/* Table Header - Desktop Only */}
    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      <div className="col-span-4">Batalha / Campanha</div>
      <div className="col-span-2">Mestre</div>
      <div className="col-span-2">Status</div>
      <div className="col-span-1 text-center">Turno</div>
      <div className="col-span-2">Data</div>
      <div className="col-span-1 text-right">Ações</div>
    </div>

    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {battles.map((battle) => (
        <div 
          key={battle._id} 
          className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center"
        >
          {/* Battle / Campaign */}
          <div className="col-span-4 flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {battle.name || "Sem Nome"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {battle.campaign?.name || "Sem Campanha"}
              </p>
            </div>
          </div>

          {/* Owner */}
          <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <User className="h-4 w-4 text-slate-400 md:hidden" />
            <span className="truncate">{battle.owner?.name || "Mestre"}</span>
          </div>

          {/* Status */}
          <div className="col-span-2">
            <Badge 
              variant={battle.active ? "default" : "secondary"}
              className={`${battle.active ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"} text-[10px] sm:text-xs font-medium border px-2 py-0.5 rounded-full`}
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
          <div className="col-span-1 text-sm font-medium text-slate-700 dark:text-slate-200 md:text-center flex items-center gap-2 md:block">
            <RotateCcw className="h-4 w-4 text-slate-400 md:hidden" />
            <span>{battle.round || 0}</span>
          </div>

          {/* Date */}
          <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 md:block">
            <Calendar className="h-4 w-4 text-slate-400 md:hidden" />
            <span>
              {battle.createdAt
                ? new Date(battle.createdAt).toLocaleDateString('pt-BR')
                : "--/--/----"}
            </span>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex justify-end items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg" asChild>
              <Link href={`/dashboard/battles/${battle._id}`}>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
            </Button>
            {currentUser?._id === battle.owner?._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <ChangeRound
                      battleId={battle._id}
                      currentRound={battle.round}
                      advance={true}
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <ChangeRound
                      battleId={battle._id}
                      currentRound={battle.round}
                      advance={false}
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={`/dashboard/battles/${battle._id}/edit`}>
                    <div className="px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer">
                      Editar Batalha
                    </div>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function BattlesDashboardClient({ allBattles, currentUser }: { allBattles: any[], currentUser: any }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter battles based on search term
  const filteredBattles = allBattles.filter((battle) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      battle.name?.toLowerCase().includes(searchLower) ||
      battle.campaign?.name?.toLowerCase().includes(searchLower) ||
      battle.owner?.name?.toLowerCase().includes(searchLower)
    );
  });

  const activeBattles = filteredBattles.filter((battle: any) => battle.active);
  const inactiveBattles = filteredBattles.filter((battle: any) => !battle.active);

  // Original unfiltered counts for stats
  const totalActive = allBattles.filter((b) => b.active).length;
  const totalInactive = allBattles.filter((b) => !b.active).length;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-indigo-600" />
            Dashboard de Batalhas
          </h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o progresso de todos os combates épicos.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" asChild>
          <Link href="/dashboard/battles/newBattle" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Batalha
          </Link>
        </Button>
      </div>

      {/* Stats Summary - Using original counts to show system state regardless of filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total de Batalhas" 
          value={allBattles.length} 
          icon={History}
          description="Contagem total no sistema"
          colorClass="bg-slate-400"
        />
        <StatCard 
          title="Batalhas Ativas" 
          value={totalActive} 
          icon={Swords}
          description="Combates em andamento agora"
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Taxa de Conclusão" 
          value={allBattles.length > 0 ? `${Math.round((totalInactive / allBattles.length) * 100)}%` : "0%"} 
          icon={Trophy}
          description="Batalhas finalizadas com sucesso"
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="active" className="px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-sm">
                Ativas ({activeBattles.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-sm">
                Arquivadas ({inactiveBattles.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Procurar batalha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-0 outline-none">
            {activeBattles.length > 0 ? (
              <BattleList battles={activeBattles} currentUser={currentUser} />
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
                    <Swords className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {searchTerm ? "Nenhuma batalha encontrada" : "Nenhum combate ativo"}
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                    {searchTerm 
                      ? "Tente buscar com outros termos." 
                      : "Todos os campos de batalha estão quietos por enquanto. Que tal iniciar uma nova saga?"}
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
              <BattleList battles={inactiveBattles} currentUser={currentUser} />
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                    <History className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {searchTerm ? "Nenhuma batalha encontrada" : "Histórico vazio"}
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                    {searchTerm
                      ? "Tente buscar com outros termos."
                      : "Não há registros de batalhas concluídas ainda. Suas vitórias e derrotas aparecerão aqui."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
