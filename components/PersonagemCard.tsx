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
    <Link href={`/dashboard/personagens/${personagem._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row p-4">
          <div className="relative w-full h-40 sm:w-20 sm:h-20 mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
            {personagem.characterUrl ? (
              <Image
                src={personagem.characterUrl}
                alt={personagem.name}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                <span className="text-4xl sm:text-2xl text-muted-foreground">
                  🧙
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow">
            <CardHeader className="p-0 pb-2">
              <h3 className="text-xl font-bold">{personagem.name}</h3>
            </CardHeader>

            <CardContent className="p-0 pb-2">
              <div className="text-sm text-muted-foreground">
                {personagem.message}
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 p-0 pt-2">
              <Badge
                variant={
                  personagem.status === "alive" ? "default" : "destructive"
                }
              >
                {personagem.status === "alive" ? "Vivo" : "Morto"}
              </Badge>

              <Badge variant="outline">{personagem.campaign.name}</Badge>
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
