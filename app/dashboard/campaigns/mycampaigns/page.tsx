"use client";

import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { useEffect, useState } from "react";
import { CampaignDocument } from "@/models/Campaign";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Dice4, ScrollText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CampaignResponse {
  ok: boolean;
  message: string;
  data?: CampaignDocument[];
}

const MyCampaigns = () => {
  const [campaignsResponse, setCampaignsResponse] =
    useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const response = await getMyCampaigns();
      setCampaignsResponse(response);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaignsResponse({
        ok: false,
        message: "Erro ao buscar campanhas",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>

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
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-sm" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-[200px]" />
                       <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                     </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Minhas campanhas</h1>
        <Link href="/dashboard/campaigns/createCampaign">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {!campaignsResponse?.ok ? (
        <div>Ocorreu um erro: {campaignsResponse?.message}</div>
      ) : campaignsResponse.data && campaignsResponse.data.length > 0 ? (
        <div className="rounded-md border mt-6">
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
              {campaignsResponse.data.map((campaign: any) => (
                <TableRow key={campaign._id.toString()}>
                  <TableCell>
                    <Avatar className="h-12 w-12 rounded-sm">
                      <AvatarImage
                        src={campaign.imageUrl || ""}
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
                        {campaign.owner?.name || campaign.owner?.username || "Você"}
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
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="flex gap-4">
            <Dice4 className="h-12 w-12 text-muted-foreground animate-bounce" />
            <ScrollText className="h-12 w-12 text-muted-foreground animate-bounce delay-100" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-muted-foreground">
              Comece sua jornada criando sua primeira campanha de RPG
            </p>
          </div>
          <Link href="/dashboard/campaigns/createCampaign">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;
