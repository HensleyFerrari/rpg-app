import { Button } from "@/components/ui/button";
import { getCampaigns } from "../../../lib/actions/campaign.actions";
import Link from "next/link";
import CampaignCard from "./components/campaignCard";
import { CampaignDocument } from "@/models/Campaign";
import { Plus } from "lucide-react";

const CampaignsPage = async () => {
  const campaignsResponse = await getCampaigns();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Campanhas</h1>
        <Link href="/dashboard/campaigns/createCampaign">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>
      {!campaignsResponse.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground mb-4">
            Não existem campanhas cadastradas
          </p>
          <Link href="/dashboard/campaigns/createCampaign">
            <Button>Criar Primeira Campanha</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {campaignsResponse.map((campaign: any) => (
            <CampaignCard
              key={campaign._id}
              id={campaign._id}
              name={campaign.name}
              description={campaign.description}
              imageUrl={campaign.imageUrl}
              owner={campaign.owner}
              createdAt={campaign.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
