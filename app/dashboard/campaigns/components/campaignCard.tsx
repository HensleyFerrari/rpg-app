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
      {/* Banner Image */}
      <div className="relative w-full h-40">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <Book className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-xl font-bold line-clamp-1">
            {name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 flex-grow">
          <div className="mb-3 text-sm text-muted-foreground line-clamp-3">
            {description ? (
              <ReadOnlyRichTextViewer content={description} />
            ) : (
              <p className="text-muted-foreground/50 italic">Sem descrição</p>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {owner && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">
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

      <CardFooter className="border-t bg-muted/10 p-3">
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
