
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const triggerBattleUpdate = async (battleId: string) => {
  try {
    // Send a lightweight update signal instead of the full battle object
    // to avoid hitting the 10KB payload limit of Pusher
    const payload = {
      _id: battleId,
      timestamp: Date.now(),
    };
    console.log(`Triggering update signal for battle ${battleId}`);
    await pusherServer.trigger(`battle-${battleId}`, "battle-updated", payload);
  } catch (error) {
    console.error("Error triggering battle update:", error);
  }
};
