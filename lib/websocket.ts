import { WebSocket } from "ws";

/**
 * Triggers a battle update signal to all connected WebSocket clients
 * subscribed to the given battle channel.
 *
 * This replaces the previous Pusher-based triggerBattleUpdate function,
 * keeping the same signature for seamless migration.
 */
export const triggerBattleUpdate = async (battleId: string) => {
  try {
    const channels = (globalThis as any).__wss_channels as
      | Map<string, Set<WebSocket>>
      | undefined;

    if (!channels) {
      console.warn(
        "[WS] WebSocket channels not initialized — are you running the custom server?",
      );
      return;
    }

    const channel = channels.get(battleId);
    if (!channel || channel.size === 0) {
      console.log(`[WS] No clients connected to battle-${battleId}, skipping`);
      return;
    }

    const payload = JSON.stringify({
      type: "battle-updated",
      battleId,
      timestamp: Date.now(),
    });

    let sent = 0;
    for (const ws of channel) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
        sent++;
      }
    }

    console.log(
      `[WS] Sent update signal to ${sent}/${channel.size} clients for battle-${battleId}`,
    );
  } catch (error) {
    console.error("[WS] Error triggering battle update:", error);
  }
};
