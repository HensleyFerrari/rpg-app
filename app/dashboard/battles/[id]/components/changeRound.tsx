"use client";

import { useRouter } from "next/navigation";
import { updateBattle } from "@/lib/actions/battle.actions";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface ChangeRoundProps {
  battleId: string;
  currentRound: number;
  advance?: boolean;
}

const ChangeRound = ({
  battleId,
  currentRound,
  advance = true,
}: ChangeRoundProps) => {
  const router = useRouter();

  const handleChangeRound = async () => {
    try {
      const newRound = advance
        ? currentRound + 1
        : Math.max(1, currentRound - 1);

      const response = await updateBattle(battleId, {
        round: newRound,
      });

      if (response.ok) {
        toast.success(advance ? "Turno avançado!" : "Turno anterior!");
        router.refresh();
      } else {
        toast.error("Erro ao mudar o turno", {
          description: response.message,
        });
      }
    } catch (error: any) {
      toast.error("Erro ao mudar o turno", {
        description: error?.message || "Ocorreu um erro inesperado",
      });
    }
  };

  return (
    <button
      onClick={handleChangeRound}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {advance ? (
        <>
          Próximo turno
          <ChevronRight className="h-4 w-4" />
        </>
      ) : (
        <>
          <ChevronLeft className="h-4 w-4" />
          Turno anterior
        </>
      )}
    </button>
  );
};

export default ChangeRound;
