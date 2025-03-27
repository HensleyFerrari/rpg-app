import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCampaigns,
  getMyCampaigns,
} from "../../../lib/actions/campaign.actions";
import CreateCampaign from "./components/createCampaign";
import Link from "next/link";
import CampaignCard from "./components/campaignCard";

const Sistemas = async () => {
  const campaigns: any = await getCampaigns();
  const myCampaigns: any = await getMyCampaigns({
    email: "hensleyferrari@gmail.com",
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="justify-between flex">
        <h1 className="font-bold text-6xl">Campanhas </h1>
      </div>
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="myCampaigns">Minhas campanhas</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          {campaigns.length === 0 ? (
            <>Não existem campanhas cadastradas</>
          ) : (
            <div className="flex flex-col gap-4">
              {campaigns.map((data) => {
                return <CampaignCard key={data._id} name={data.name} />;
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="myCampaigns">
          {!myCampaigns ? (
            <>Não existem campanhas cadastradas</>
          ) : (
            <div className="flex flex-col gap-4">
              {myCampaigns.map((data) => {
                return <CampaignCard key={data._id} name={data.name} />;
              })}
            </div>
          )}
          <Link href="/dashboard/campaigns/createCampaign">
            Criar uma nova campanha
          </Link>
          <CreateCampaign />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sistemas;
