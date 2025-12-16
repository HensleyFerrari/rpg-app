
import Pusher from "pusher";
import { getBattleById } from "./actions/battle.actions";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const triggerBattleUpdate = async (battleId: string) => {
  try {
    const battle = await getBattleById(battleId);
    if (battle.ok && battle.data) {
      await pusherServer.trigger(`battle-${battleId}`, "battle-updated", battle.data);
    }
  } catch (error) {
    console.error("Error triggering battle update:", error);
  }
};
