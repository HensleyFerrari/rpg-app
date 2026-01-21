"use client";

import {
  getBattleById,
  removeCharacterFromBattle,
} from "@/lib/actions/battle.actions";
import { deleteDamage } from "@/lib/actions/damage.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ArrowLeft,
  UserMinus,
  Shield,
  Users,
  Swords,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Battle = {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
  };
  rounds: Array<{
    _id: string;
    damage: number;
    round: number;
    isCritical: boolean;
    character?: {
      name: string;
    };
    target?: {
      name: string;
    };
    description?: string;
    type?: string;
  }>;
  characters: Array<{
    _id: string;
    name: string;
  }>;
};

import AddCharacterModal from "../components/addCharacter";

const ManageBattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [damageToDelete, setDamageToDelete] = useState<string | null>(null);
  const [characterToRemove, setCharacterToRemove] = useState<string | null>(
    null
  );

  // States for collapsible sections
  const [isCharactersExpanded, setIsCharactersExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const battleResponse = await getBattleById(id as string);
        if (battleResponse.ok) {
          setBattle(battleResponse.data);
          const user = await getCurrentUser();
          setIsOwner(user._id === battleResponse.data.owner._id);
        }
      } catch (error) {
        console.error("Error fetching battle:", error);
        toast.error("Erro ao carregar batalha");
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [id]);

  const handleDeleteDamage = async () => {
    if (!damageToDelete) return;

    try {
      const response = await deleteDamage(damageToDelete, id as string);
      if (response.ok) {
        toast.success(response.message);
        // Refresh battle data
        const updatedBattle = await getBattleById(id as string);
        if (updatedBattle.ok) {
          setBattle(updatedBattle.data);
          window.dispatchEvent(
            new CustomEvent("battleUpdated", { detail: updatedBattle.data })
          );
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting damage:", error);
      toast.error("Erro ao deletar dano");
    } finally {
      setDamageToDelete(null);
    }
  };

  const handleRemoveCharacter = async () => {
    if (!characterToRemove) return;

    try {
      const response = await removeCharacterFromBattle(
        characterToRemove,
        id as string
      );
      if (response.ok) {
        toast.success("Personagem removido com sucesso");
        // Refresh battle data
        const updatedBattle = await getBattleById(id as string);
        if (updatedBattle.ok) {
          setBattle(updatedBattle.data);
          window.dispatchEvent(
            new CustomEvent("battleUpdated", { detail: updatedBattle.data })
          );
        }
      } else {
        toast.error(response.message || "Erro ao remover personagem");
      }
    } catch (error) {
      console.error("Error removing character:", error);
      toast.error("Erro ao remover personagem");
    } finally {
      setCharacterToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!battle || !isOwner) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Acesso não autorizado
            </h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para gerenciar esta batalha.
            </p>
            <Link href="/dashboard/battles">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Batalhas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Painel de Gerenciamento</h1>
          <p className="text-muted-foreground mt-1">Controle total sobre {battle.name}</p>
        </div>
        <Link href={`/dashboard/battles/${id}`}>
          <Button variant="outline" className="gap-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Batalha
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Characters Section */}
        <Card className="overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-sm">
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer py-4 hover:bg-muted/30 transition-colors"
            onClick={() => setIsCharactersExpanded(!isCharactersExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Personagens</CardTitle>
                <p className="text-xs text-muted-foreground">Gerencie quem participa desta batalha</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AddCharacterModal />
              {isCharactersExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </div>
          </CardHeader>
          <div className={cn("transition-all duration-300 ease-in-out", isCharactersExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden")}>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-card/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-4">Nome</TableHead>
                      <TableHead className="text-right py-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battle.characters.map((character) => (
                      <TableRow key={character._id} className="group hover:bg-muted/40 transition-colors border-muted">
                        <TableCell className="font-medium py-3">
                          {character.name}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground group-hover:text-destructive transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCharacterToRemove(character._id);
                                }}
                              >
                                <UserMinus className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover <strong>{character.name}</strong> da batalha?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setCharacterToRemove(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleRemoveCharacter}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {battle.characters.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="h-10 w-10 opacity-10" />
                            <p className="text-sm">Nenhum personagem na batalha</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Damage History Section */}
        <Card className="overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-sm">
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer py-4 hover:bg-muted/30 transition-colors"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Swords className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Histórico de Danos</CardTitle>
                <p className="text-xs text-muted-foreground">Visualize e gerencie cada evento da batalha</p>
              </div>
            </div>
            {isHistoryExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </CardHeader>
          <div className={cn("transition-all duration-300 ease-in-out", isHistoryExpanded ? "max-h-[1000px] opacity-100 overflow-auto" : "max-h-0 opacity-0 overflow-hidden")}>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-card/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px] py-4">Rodada</TableHead>
                      <TableHead className="py-4">Personagem</TableHead>
                      <TableHead className="py-4">Alvo</TableHead>
                      <TableHead className="text-center w-[120px] py-4">Valor</TableHead>
                      <TableHead className="text-center w-[150px] py-4">Tipo/Descrição</TableHead>
                      <TableHead className="text-center w-[100px] py-4">Crítico</TableHead>
                      <TableHead className="text-right w-[100px] py-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battle.rounds.map((round) => (
                      <TableRow key={round._id} className="group hover:bg-muted/40 transition-colors border-muted">
                        <TableCell className="py-3">
                          <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary w-7 h-7 text-xs font-bold">
                            {round.round}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium py-3">
                          {round.character?.name || (round.type === "other" ? "Evento" : "N/A")}
                        </TableCell>
                        <TableCell className="py-3">
                          {round.target?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center py-3 font-semibold">
                          {round.damage}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {round.type === "damage" ? (
                            <span className="text-destructive font-medium">Dano</span>
                          ) : round.type === "heal" ? (
                            <span className="text-green-500 font-medium">Cura</span>
                          ) : (
                            <span className="text-muted-foreground italic">
                              {round.description || "Evento"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {round.isCritical ? (
                            <span className="text-amber-500 font-bold text-xs px-2 py-0.5 rounded-full bg-amber-500/10 uppercase">Sim</span>
                          ) : (
                            <span className="text-muted-foreground text-xs uppercase">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground group-hover:text-destructive transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDamageToDelete(round._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Deletar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este registro de dano?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDamageToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteDamage}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {battle.rounds.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Swords className="h-10 w-10 opacity-10" />
                            <p className="text-sm">Nenhum dano registrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManageBattlePage;
