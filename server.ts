import { createServer, IncomingMessage } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import type { Duplex } from "stream";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Channel map: battleId -> Set of WebSocket connections
const channels = new Map<string, Set<WebSocket>>();

// Make channels accessible globally for server actions
(globalThis as any).__wss_channels = channels;

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  // Store pending upgrade requests that are NOT for /ws
  // so Next.js can handle them (HMR in dev mode)
  const pendingUpgrades: Array<[IncomingMessage, Duplex, Buffer]> = [];

  server.on("upgrade", (req, socket, head) => {
    const { pathname, query } = parse(req.url!, true);

    if (pathname === "/ws") {
      // Handle our custom WebSocket path
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req, query);
      });
    }
    // For all other paths (e.g. /_next/webpack-hmr), do nothing here.
    // Next.js dev server adds its own "upgrade" listener during app.prepare()
    // and Node.js EventEmitter calls ALL listeners, so Next.js will handle it.
  });

  wss.on("connection", (ws: WebSocket, _req: any, query: any) => {
    const battleId = query.battleId as string;

    if (!battleId) {
      ws.close(1008, "battleId is required");
      return;
    }

    // Subscribe this connection to the battle channel
    if (!channels.has(battleId)) {
      channels.set(battleId, new Set());
    }
    channels.get(battleId)!.add(ws);

    console.log(
      `[WS] Client connected to battle-${battleId} (${channels.get(battleId)!.size} clients)`,
    );

    // Send confirmation
    ws.send(JSON.stringify({ type: "connected", battleId }));

    ws.on("close", () => {
      const channel = channels.get(battleId);
      if (channel) {
        channel.delete(ws);
        if (channel.size === 0) {
          channels.delete(battleId);
        }
      }
      console.log(`[WS] Client disconnected from battle-${battleId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on battle-${battleId}:`, err);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}/ws`);
  });
});
