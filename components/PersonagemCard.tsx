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
  campaign: {
    _id: string;
    name: string;
  };
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
    <Link
      href={`/dashboard/personagens/${personagem._id}`}
      className="block h-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="flex flex-col p-4 h-full">
          <div className="relative w-full h-40 mb-4 flex-shrink-0">
            {personagem.characterUrl ? (
              <Image
                src={personagem.characterUrl}
                alt={personagem.name}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                <span className="text-4xl text-muted-foreground">🧙</span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow">
            <CardHeader className="p-0 pb-2">
              <h3 className="text-xl font-bold line-clamp-1">
                {personagem.name}
              </h3>
            </CardHeader>

            <CardContent className="p-0 pb-2 flex-grow">
              <div className="text-sm text-muted-foreground line-clamp-2">
                {personagem.message}
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 p-0 pt-2 mt-auto">
              <Badge
                variant={
                  personagem.status === "alive" ? "default" : "destructive"
                }
              >
                {personagem.status === "alive" ? "Vivo" : "Morto"}
              </Badge>

              <Badge variant="outline" className="line-clamp-1">
                {personagem.campaign.name}
              </Badge>
              <Badge variant="outline">
                Batalhas: {personagem.battles.length}
              </Badge>
            </CardFooter>
          </div>
        </div>
      </Card>
    </Link>
  );
}
