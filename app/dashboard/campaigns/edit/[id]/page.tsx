import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCampaignById } from "@/lib/actions/campaign.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditCampaignForm from "./EditCampaignForm";

export const metadata: Metadata = {
  title: "Edit Campaign",
  description: "Edit your RPG campaign details",
};

export default async function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    return notFound();
  }

  // Check if the logged-in user is the owner of the campaign
  if (campaign.data.owner.email !== session.user.email) {
    redirect("/dashboard/campaigns");
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editar Campanha</h1>
        {JSON.stringify(campaign)}
        <EditCampaignForm campaign={campaign.data} />
      </div>
    </div>
  );
}
