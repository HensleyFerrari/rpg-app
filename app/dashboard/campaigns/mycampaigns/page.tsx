"use client";

import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { useEffect, useState } from "react";
import CampaignCard from "../components/campaignCard";
import { CampaignDocument } from "@/models/Campaign";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Dice4, ScrollText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 p-6 rounded-lg border"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mt-6">
          {campaignsResponse.data.map((campaign: any) => (
            <CampaignCard
              key={campaign._id}
              id={campaign._id.toString()}
              name={campaign.name}
              description={campaign.description}
              imageUrl={campaign.imageUrl || ""}
              owner={campaign.owner}
              createdAt={campaign.createdAt?.toString() || ""}
            />
          ))}
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
