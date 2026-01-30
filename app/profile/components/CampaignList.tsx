import Link from "next/link";
import Image from "next/image";
import { CampaignDocument } from "@/models/Campaign";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

interface CampaignListProps {
  campaigns: CampaignDocument[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card/50 border-dashed">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Nenhuma campanha encontrada</h3>
        <p className="text-muted-foreground max-w-sm mt-2 mb-4">
          Você ainda não criou nenhuma campanha. Comece sua jornada criando um novo mundo.
        </p>
        <Button asChild>
            <Link href="/dashboard?new=true">Criar Campanha</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <Card key={campaign._id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
          <div className="relative aspect-video w-full bg-muted">
            {campaign.imageUrl ? (
              <Image
                src={campaign.imageUrl}
                alt={campaign.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Crown className="h-12 w-12 text-muted-foreground/20" />
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description || "Sem descrição disponível."}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/campaigns/${campaign._id}`}>
                Ver Campanha <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
