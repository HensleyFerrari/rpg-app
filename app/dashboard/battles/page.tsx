import { getAllBattles } from "@/lib/actions/battle.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import BattlesDashboardClient from "./battles-client";

export const dynamic = 'force-dynamic';

const BattlesDashboard = async () => {
  const battles = await getAllBattles();
  const currentUser = await getCurrentUser();

  const allBattles = battles?.data || [];

  return (
    <BattlesDashboardClient 
      allBattles={allBattles}
      currentUser={currentUser} 
    />
  );
};

export default BattlesDashboard;
