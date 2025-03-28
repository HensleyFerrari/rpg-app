import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function CampaignNotFound() {
  return (
    <div className="container mx-auto py-16 flex flex-col items-center justify-center text-center">
      <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
      <h2 className="text-3xl font-bold mb-2">Campanha não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        A campanha que você está procurando não existe ou foi removida.
        Verifique o link e tente novamente.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/dashboard/campaigns">Ver todas campanhas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/campaigns/createCampaign">
            Criar nova campanha
          </Link>
        </Button>
      </div>
    </div>
  );
}
