import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Calendar, Info, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  owner?: {
    name?: string;
    username?: string;
    _id: string;
  };
  createdAt?: string;
};

const CampaignCard = ({
  id,
  name,
  description,
  imageUrl,
  owner,
  createdAt,
}: Props) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="flex p-4">
        {/* Imagem/Ícone à esquerda */}
        <div className="mr-4 flex-shrink-0">
          {imageUrl ? (
            <div className="relative w-20 h-20 rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="bg-muted/30 w-20 h-20 rounded-md flex items-center justify-center">
              <Book className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Conteúdo à direita */}
        <div className="flex-1 min-w-0">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-xl font-bold line-clamp-1">
              {name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-grow">
            {description ? (
              <p className="text-muted-foreground line-clamp-3">
                {description}
              </p>
            ) : (
              <p className="text-muted-foreground/50 italic">Sem descrição</p>
            )}

            <div className="mt-2 space-y-1 text-sm">
              {owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {owner.name || owner.username || "Usuário desconhecido"}
                  </span>
                </div>
              )}

              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{formattedDate}</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </div>

      <CardFooter className="border-t bg-muted/10 pt-4">
        <Link href={`/dashboard/campaigns/${id}`} className="w-full">
          <Button variant="default" className="w-full gap-2">
            <Info className="h-4 w-4" />
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
