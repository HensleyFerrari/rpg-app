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

  const [currentUser, battles, campaigns] = await Promise.all([
    getCurrentUser(),
    getBattles({ query, filterType, campaignId }),
    getCampaigns()
  ]);

  const allBattles = battles.ok ? battles.data : [];

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
