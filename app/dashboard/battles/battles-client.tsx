"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditBattleModal } from "./components/edit-battle-modal";
import {
  MoreVertical,
  Swords,
  History,
  Plus,
  Calendar,
  User,
  RotateCcw,
  LayoutDashboard,
  Trophy,
  ChevronRight,
  Shield
} from "lucide-react";
import { BattleFilters } from "./components/battle-filters";
import { CreateBattleModal } from "./components/create-battle-modal";
import { useState, useEffect } from "react";

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

const BattleList = ({ battles, currentUser, onEdit }: { battles: any[], currentUser: any, onEdit: (battle: any) => void }) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    {/* Table Header - Desktop Only */}
    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <div className="col-span-4">Batalha</div>
      <div className="col-span-2">Mestre</div>
      <div className="col-span-2">Status</div>
      <div className="col-span-1 text-center">Turno</div>
      <div className="col-span-2">Data</div>
      <div className="col-span-1 text-right">Ações</div>
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
          <div className="hidden md:flex col-span-4 items-center gap-4">
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
              <p className="text-xs text-muted-foreground truncate">
                {battle.campaign?.name || "Sem Campanha"}
              </p>
            </div>
          </div>

          {/* Owner */}
          <div className="flex md:col-span-2 items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:w-auto w-full mt-2 md:mt-0 pl-[60px] md:pl-0">
            <User className="h-4 w-4 text-slate-400 md:hidden" />
            <span className="truncate text-xs md:text-sm">{battle.owner?.name || "Mestre"}</span>
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
          <div className="md:col-span-1 flex justify-end items-center gap-2 w-full md:w-auto mt-3 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
            <Button variant="ghost" size="sm" className="h-8 w-full md:w-8 px-2 md:px-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden text-xs justify-center" asChild>
              <Link href={`/dashboard/battles/${battle._id}`}>
                Ver Batalha
              </Link>
            </Button>

            {/* Desktop Action Button */}
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg hidden md:flex" asChild>
              <Link href={`/dashboard/battles/${battle._id}`}>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
            </Button>

            {currentUser?._id === battle.owner?._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shrink-0">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      // Delay opening the modal to allow the dropdown to close properly
                      // preventing focus mgmt conflicts in Radix UI
                      setTimeout(() => onEdit(battle), 50);
                    }}
                    className="cursor-pointer"
                  >
                    Editar Batalha
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function BattlesDashboardClient({ allBattles, currentUser, campaigns }: { allBattles: any[], currentUser: any, campaigns: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Calculated stats based on the filtered view (allBattles contains the filtered result from server)
  const totalActive = allBattles.filter((b) => b.active).length;
  const totalInactive = allBattles.filter((b) => !b.active).length;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBattleDraft, setCreateBattleDraft] = useState<any>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get("action") === "new-battle") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("action") === "new-battle") {
        params.delete("action");
        setTimeout(() => {
          router.replace(`${pathname}?${params.toString()}`);
        }, 100);
      }
    }
  };

  const handleEditBattle = (battle: any) => {
    setSelectedBattle(battle);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <CreateBattleModal
        open={isCreateModalOpen}
        onOpenChange={handleOpenChange}
        draftData={createBattleDraft}
        onSaveDraft={setCreateBattleDraft}
      />

      <EditBattleModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        battle={selectedBattle}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Dashboard de Batalhas
          </h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o progresso de todos os combates épicos.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Batalha
        </Button>
      </div>

      {/* Stats Summary - Reflects CURRENT FILTERED VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Batalhas Listadas"
          value={allBattles.length}
          icon={History}
          description="Quantidade na visualização atual"
          colorClass="bg-slate-400"
        />
        <StatCard
          title="Ativas"
          value={totalActive}
          icon={Swords}
          description="Em andamento nesta lista"
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Concluídas"
          value={totalInactive}
          icon={Trophy}
          description="Finalizadas nesta lista"
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">

        <BattleFilters campaigns={campaigns} />

        {allBattles.length > 0 ? (
          <BattleList
            battles={allBattles}
            currentUser={currentUser}
            onEdit={handleEditBattle}
          />
        ) : (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                <Swords className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold">
                Nenhuma batalha encontrada
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                Tente ajustar os filtros ou iniciar uma nova jornada.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-lg"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Criar Batalha
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

