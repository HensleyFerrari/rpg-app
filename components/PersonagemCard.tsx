import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Sword } from "lucide-react";
import { CharacterStatusBadge } from "@/components/ui/character-status-badge";
import { ReadOnlyRichTextViewer } from "./ui/rich-text-editor";

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
              <div className="text-sm text-muted-foreground overflow-scroll max-h-36 whitespace-pre-line break-words">
                <ReadOnlyRichTextViewer content={personagem.message} />
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 p-0 pt-2 mt-auto">
              <CharacterStatusBadge
                status={personagem.status as "alive" | "dead"}
              />

              <Badge
                variant="outline"
                className="line-clamp-1 flex items-center gap-1"
              >
                <Book className="w-3 h-3" />
                {personagem.campaign.name}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Sword className="w-3 h-3" />
                Batalhas: {personagem.battles.length}
              </Badge>
            </CardFooter>
          </div>
        </div>
      </Card>
    </Link>
  );
}
