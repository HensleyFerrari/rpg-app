import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaigns } from "../../../lib/actions/campaign.actions";
import Link from "next/link";
import CampaignCard from "./components/campaignCard";
import { CampaignDocument } from "@/models/Campaign";

const Sistemas = async () => {
  const campaigns: Array<CampaignDocument> = await getCampaigns();

  return (
    <div className="flex flex-col gap-5">
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          {campaigns.message ? (
            <>Não existem campanhas cadastradas</>
          ) : (
            <div className="flex flex-col gap-4">
              {campaigns.map((data: CampaignDocument) => {
                return <CampaignCard key={data._id} name={data.name} />;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sistemas;
