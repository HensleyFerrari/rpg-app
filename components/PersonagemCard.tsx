import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Personagem = {
  _id: string;
  name: string;
  owner: string;
  campaign: string;
  characterUrl: string;
  battles: string[];
  message: string;
  status: string;
  createdAt: Date;
  updateAt: Date;
};

interface PersonagemCardProps {
  personagem: Personagem;
}

export default function PersonagemCard({ personagem }: PersonagemCardProps) {
  return (
    <Link href={`/dashboard/personagens/${personagem._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 w-full">
          {personagem.characterUrl ? (
            <Image
              src={personagem.characterUrl}
              alt={personagem.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">🧙</span>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="text-xl font-bold">{personagem.name}</h3>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="text-sm text-muted-foreground">
            {personagem.message}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-0">
          <Badge
            variant={personagem.status === "alive" ? "success" : "destructive"}
          >
            {personagem.status === "alive" ? "Vivo" : "Morto"}
          </Badge>

          <Badge variant="outline">Batalhas: {personagem.battles.length}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
