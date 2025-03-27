"use client";

import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CampaignCard from "../components/campaignCard";
import { CampaignDocument } from "@/models/Campaign";

const MyCampaigns = () => {
  const { data } = useSession();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchMyCampaigns(data?.user?.email);
  }, [data]);

  const fetchMyCampaigns = async (email: string) => {
    const campaigns: Array<CampaignDocument> = await getMyCampaigns({
      email,
    });

    setCampaigns(campaigns);
  };

  return (
    <div className="flex flex-col gap-4">
      Minhas campanhas
      {campaigns.map((data: CampaignDocument) => {
        return <CampaignCard key={data._id} name={data.name} />;
      })}
    </div>
  );
};

export default MyCampaigns;
