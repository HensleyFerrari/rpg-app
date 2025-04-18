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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    character: {
      name: string;
    };
  }>;
  characters: Array<{
    _id: string;
    name: string;
  }>;
};

const ManageBattlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [damageToDelete, setDamageToDelete] = useState<string | null>(null);
  const [characterToRemove, setCharacterToRemove] = useState<string | null>(
    null
  );

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
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-muted-foreground" />
              <Skeleton className="h-8 w-2/3" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!battle || !isOwner) {
    return (
      <div className="container mx-auto p-4">
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
    <div className="container mx-auto p-4">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Batalhas", href: "/dashboard/battles" },
          { label: battle.name, href: `/dashboard/battles/${battle._id}` },
          { label: "Gerenciar" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Danos - {battle.name}</h1>
        <Link href={`/dashboard/battles/${id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Personagens na Batalha</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {battle.characters.map((character) => (
                <TableRow key={character._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {character.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => setCharacterToRemove(character._id)}
                        >
                          <UserMinus className="h-4 w-4" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este personagem da
                            batalha? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setCharacterToRemove(null)}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleRemoveCharacter}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {battle.characters.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground h-24"
                  >
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum personagem na batalha
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead className="font-semibold">Round</TableHead>
              <TableHead className="font-semibold">Personagem</TableHead>
              <TableHead className="font-semibold">Dano</TableHead>
              <TableHead className="font-semibold">Crítico</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {battle.rounds.map((round) => (
              <TableRow key={round._id} className="hover:bg-muted/50">
                <TableCell>{round.round}</TableCell>
                <TableCell className="font-medium">
                  {round.character.name}
                </TableCell>
                <TableCell>{round.damage}</TableCell>
                <TableCell>{round.isCritical ? "Sim" : "Não"}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => setDamageToDelete(round._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este dano? Esta ação
                          não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDamageToDelete(null)}
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDamage}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {battle.rounds.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground h-24"
                >
                  <Swords className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum dano registrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageBattlePage;
