import { getBattles } from "@/lib/actions/battle.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getCampaigns } from "@/lib/actions/campaign.actions";
import BattlesDashboardClient from "./battles-client";

export const dynamic = 'force-dynamic';

const BattlesDashboard = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: "all" | "my"; campaign?: string }>;
}) => {
  const { q: query, filter: filterType, campaign: campaignId } = await searchParams;
  const currentUser = await getCurrentUser();

  const battles = await getBattles({ query, filterType, campaignId });
  const allBattles = battles.ok ? battles.data : [];

  // Fetch campaigns for the filter dropdown
  const campaigns = await getCampaigns(); 

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      <BattlesDashboardClient 
        allBattles={allBattles}
        currentUser={currentUser}
        campaigns={Array.isArray(campaigns) ? campaigns : []}
      />
    </div>
  );
};

export default BattlesDashboard;
