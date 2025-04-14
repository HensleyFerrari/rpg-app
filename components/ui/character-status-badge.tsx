import { Badge } from "./badge";
import { Heart, Skull } from "lucide-react";

export function CharacterStatusBadge({ status }: any) {
  return (
    <Badge
      variant={status === "alive" ? "default" : "destructive"}
      className="flex items-center gap-1 font-bold"
    >
      {status === "alive" ? (
        <>
          <Heart className="w-3 h-3" />
          Vivo
        </>
      ) : (
        <>
          <Skull className="w-3 h-3" />
          Morto
        </>
      )}
    </Badge>
  );
}
