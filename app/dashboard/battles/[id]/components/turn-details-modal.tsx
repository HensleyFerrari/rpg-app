"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User, Heart, Swords, Target, MessageSquare, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TurnDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turn: any;
}

export function TurnDetailsModal({
  open,
  onOpenChange,
  turn,
}: TurnDetailsModalProps) {
  if (!turn) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data desconhecida";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEvent = turn.type === "other";
  const isHeal = turn.type === "heal";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Rodada {turn.round}</Badge>
            <DialogTitle>Detalhes do Turno</DialogTitle>
          </div>
          <DialogDescription>
            Informações detalhadas sobre este evento na batalha.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Main Action Info */}
          <div className="flex flex-col gap-2 p-4 bg-muted/40 rounded-lg border">
            {!isEvent ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {isHeal ? <Heart className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                    {isHeal ? "Cura Realizada" : "Dano Causado"}
                  </span>
                  <span className={`text-2xl font-bold ${isHeal ? "text-green-500" : "text-amber-500"}`}>
                    {turn.damage}
                  </span>
                </div>
                {turn.isCritical && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Acerto Crítico!
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Evento de Narrativa</span>
              </div>
            )}

            {turn.description && (
              <div className="mt-2 text-sm italic border-l-2 border-primary/20 pl-3 py-1">
                "{turn.description}"
              </div>
            )}
          </div>

          <Separator />

          {/* Involvement */}
          <div className="grid grid-cols-2 gap-4">
            {(turn.character || !isEvent) && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <User className="w-3 h-3" /> Origem
                </span>
                <p className="text-sm font-medium truncate">{turn.character?.name || "Sistema"}</p>
              </div>
            )}
            {!isEvent && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Target className="w-3 h-3" /> Alvo
                </span>
                <p className="text-sm font-medium truncate">{turn.target?.name || "N/A"}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Criado em
              </span>
              <span>{formatDate(turn.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Registrado por
              </span>
              <span className="font-medium">{turn.owner?.name || "Sistema"}</span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
