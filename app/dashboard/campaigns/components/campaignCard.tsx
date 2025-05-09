import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";
import { Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

const CampaignCard = ({ id, name, description, imageUrl }: Props) => {
  return (
    <Card className="pt-0 flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Banner Image */}
      <div className="relative w-full aspect-video">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <Book className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>
              {description ? (
                <ReadOnlyRichTextViewer content={description} />
              ) : (
                "Sem descrição"
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="mt-auto flex-col gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/campaigns/${id}`}>Visualizar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
