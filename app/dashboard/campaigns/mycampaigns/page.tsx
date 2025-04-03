"use client";

import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CampaignCard from "../components/campaignCard";
import { CampaignDocument } from "@/models/Campaign";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CampaignResponse {
  ok: boolean;
  message: string;
  data?: CampaignDocument[];
}

const MyCampaigns = () => {
  const { data: session } = useSession();
  const [campaignsResponse, setCampaignsResponse] =
    useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchMyCampaigns(session.user.email);
    }
  }, [session]);

  const fetchMyCampaigns = async (email: string) => {
    try {
      setLoading(true);
      const response = await getMyCampaigns({ email });
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
    return <div>Carregando suas campanhas...</div>;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {campaignsResponse.data.map((campaign: CampaignDocument) => (
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
        <div className="flex flex-col items-center gap-4 py-8">
          <p>Você ainda não criou nenhuma campanha</p>
          <Link href="/dashboard/campaigns/createCampaign">
            <Button>Criar Nova Campanha</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;
