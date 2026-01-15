import { Button } from "@/components/ui/button";
import { getCampaigns } from "../../../lib/actions/campaign.actions";
import Link from "next/link";
import { Plus, Dice4, ScrollText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CampaignFilters } from "./components/campaign-filters";

const CampaignsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: "all" | "my" }>;
}) => {
  const { q: query, filter: filterType } = await searchParams;

  const campaignsResponse = await getCampaigns({ query, filterType });
  const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : []; // Handle potential non-array response safely if needed, though getCampaigns returns array or serialized array

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Campanhas</h1>
            <Link href="/dashboard/campaigns/createCampaign">
            <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Campanha
            </Button>
            </Link>
        </div>
        
        <CampaignFilters />
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center rounded-md border border-dashed p-8">
            <div className="flex gap-4">
            <Dice4 className="h-12 w-12 text-muted-foreground/50" />
            <ScrollText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
            <h3 className="text-xl font-semibold">
                Nenhuma campanha encontrada
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                {query 
                ? `Não encontramos nenhuma campanha com o termo "${query}". Tente buscar por outro nome.` 
                : "Não existem campanhas cadastradas para o filtro selecionado."}
            </p>
            </div>
            {!query && (
                <Link href="/dashboard/campaigns/createCampaign">
                    <Button>Criar Primeira Campanha</Button>
                </Link>
            )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagem</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Mestre</TableHead>
                <TableHead className="hidden md:table-cell">Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign: any) => (
                <TableRow key={campaign._id}>
                  <TableCell>
                    <Avatar className="h-12 w-12 rounded-sm">
                      <AvatarImage
                        src={campaign.imageUrl}
                        className="object-cover"
                        alt={campaign.name}
                      />
                      <AvatarFallback className="rounded-sm">
                        {campaign.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{campaign.name}</span>
                       <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] md:max-w-xs">
                          {campaign.description ? (
                             campaign.description.replace(/<[^>]*>?/gm, '') 
                          ) : (
                             "Sem descrição"
                          )}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {campaign.owner?.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {campaign.owner?.name || campaign.owner?.username || "Desconhecido"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {campaign.createdAt
                      ? new Date(campaign.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/campaigns/${campaign._id}`}>
                      <Button variant="ghost" size="sm">
                        Visualizar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
