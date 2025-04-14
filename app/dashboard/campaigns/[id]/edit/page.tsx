"use client";

import { notFound, redirect } from "next/navigation";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import EditCampaignForm from "./EditCampaignForm";
import { use, useEffect, useState } from "react";
import type { CampaignDocument } from "@/models/Campaign";

type Params = Promise<{ id: string[] }>;

export default function EditCampaignPage(props: { params: Params }) {
  const { data: session } = useSession();
  const params = use(props.params);
  const [campaign, setCampaign] = useState<CampaignDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const id = params.id;
      const campaignData = await getCampaignById(id);

      if (!campaignData || !campaignData.data) {
        return notFound();
      }

      const campaign = Array.isArray(campaignData.data)
        ? campaignData.data[0]
        : campaignData.data;

      // Check if the user is the owner
      const ownerEmail =
        typeof campaign.owner === "object" && "email" in campaign.owner
          ? campaign.owner.email
          : undefined;

      if (ownerEmail !== session.user.email) {
        redirect("/dashboard/campaigns");
      }

      setCampaign(campaign);
      setLoading(false);
    };

    fetchData();
  }, [params.id, session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Campanhas", href: "/dashboard/campaigns" },
            { label: "Editar Campanha" },
          ]}
        />
        <h1 className="text-3xl font-bold mb-6">Editar Campanha</h1>
        {campaign && <EditCampaignForm campaign={campaign} />}
      </div>
    </div>
  );
}
