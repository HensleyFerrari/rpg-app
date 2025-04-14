"use client";

import { notFound, redirect } from "next/navigation";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import EditCampaignForm from "./EditCampaignForm";
import { useEffect, useState } from "react";
import type { CampaignDocument } from "@/models/Campaign";
import { getCurrentUser } from "@/lib/actions/user.actions";

type Props = {
  params: {
    id: string;
  };
};

export default function EditCampaignPage({ params }: Props) {
  const [campaign, setCampaign] = useState<CampaignDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaignData = await getCampaignById(params.id);
        const actualUser = await getCurrentUser();

        if (!campaignData?.ok || !campaignData.data) {
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

        if (ownerEmail !== actualUser.email) {
          return redirect("/dashboard/campaigns");
        }

        setCampaign(campaign);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        return redirect("/dashboard/campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Carregando...</div>;
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
