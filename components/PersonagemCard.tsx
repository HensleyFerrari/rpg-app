import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CharacterStatusBadge } from "@/components/ui/character-status-badge";
import { ReadOnlyRichTextViewer } from "./ui/rich-text-editor";
import { Button } from "@/components/ui/button";

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
    <Card className="pt-0 flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative w-full aspect-video">
        {personagem.characterUrl ? (
          <Image
            src={personagem.characterUrl}
            alt={personagem.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <span className="text-4xl">🧙</span>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{personagem.name}</CardTitle>
            <CardDescription>{personagem.campaign.name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <CharacterStatusBadge
              status={personagem.status as "alive" | "dead"}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-muted-foreground overflow-hidden max-h-36">
          <ReadOnlyRichTextViewer content={personagem.message} />
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-col gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/personagens/${personagem._id}`}>
            Visualizar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
