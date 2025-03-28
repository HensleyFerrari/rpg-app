import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/actions/campaign.actions";

export const metadata: Metadata = {
  title: "Edit Campaign",
  description: "Edit your RPG campaign details",
};

export default async function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    return notFound();
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>
        {/* <EditCampaignForm campaign={campaign} /> */}
      </div>
    </div>
  );
}
