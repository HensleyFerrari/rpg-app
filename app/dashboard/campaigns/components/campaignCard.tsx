import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";
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
    _id?: string;
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
      <div className="flex flex-col sm:flex-row p-3 sm:p-4 flex-grow">
        {/* Imagem/Ícone - responsivo */}
        <div className="mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 self-center sm:self-start">
          {imageUrl ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden mx-auto sm:mx-0">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            </div>
          ) : (
            <div className="bg-muted/30 w-16 h-16 sm:w-20 sm:h-20 rounded-md flex items-center justify-center mx-auto sm:mx-0">
              <Book className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Conteúdo - responsivo */}
        <div className="flex-1 min-w-0 flex flex-col">
          <CardHeader className="p-0 pb-2 text-center sm:text-left">
            <CardTitle className="text-lg sm:text-xl font-bold line-clamp-1">
              {name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-grow text-center sm:text-left">
            {description ? (
              <p className="text-sm text-muted-foreground overflow-scroll max-h-36 whitespace-pre-line break-words">
                <ReadOnlyRichTextViewer content={description} />
              </p>
            ) : (
              <p className="text-muted-foreground/50 italic text-sm sm:text-base">
                Sem descrição
              </p>
            )}
          </CardContent>

          <div className="mt-auto space-y-1 text-xs sm:text-sm mx-auto sm:mx-0 max-w-fit sm:max-w-none overflow-x-auto">
            {owner && (
              <div className="flex items-center gap-2 truncate">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">
                  {owner.name || owner.username || "Usuário desconhecido"}
                </span>
              </div>
            )}

            {formattedDate && (
              <div className="flex items-center gap-2 truncate">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">
                  {formattedDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardFooter className="border-t bg-muted/10 p-3 sm:pt-4">
        <Link href={`/dashboard/campaigns/${id}`} className="w-full">
          <Button
            variant="default"
            className="w-full gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
          >
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
