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
import { Trash2, ArrowLeft, UserMinus } from "lucide-react";
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
    return <div>Carregando...</div>;
  }

  if (!battle || !isOwner) {
    return <div>Acesso não autorizado</div>;
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
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {battle.characters.map((character) => (
                <TableRow key={character._id}>
                  <TableCell>{character.name}</TableCell>
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
                  <TableCell colSpan={2} className="text-center">
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
            <TableRow>
              <TableHead>Round</TableHead>
              <TableHead>Personagem</TableHead>
              <TableHead>Dano</TableHead>
              <TableHead>Crítico</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {battle.rounds.map((round) => (
              <TableRow key={round._id}>
                <TableCell>{round.round}</TableCell>
                <TableCell>{round.character.name}</TableCell>
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
                <TableCell colSpan={5} className="text-center">
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
