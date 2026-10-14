import { Hono } from "hono";
import { cors } from "hono/cors";
import { AccessToken } from "livekit-server-sdk";
import { startRealtimeSession } from "./src/ai/realtime";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    status: "Backend Running",
  });
});

app.get("/api/token", async (c) => {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: "student",
    }
  );

  at.addGrant({
    roomJoin: true,
    room: "german-speaking-room",
    canPublish: true,
    canSubscribe: true,
  });

  return c.json({
    token: await at.toJwt(),
    roomName: "german-speaking-room",
    participantName: "student",
    url: process.env.LIVEKIT_URL,
  });
});

app.get("/api/realtime", async (c) => {
  try {
    const session = await startRealtimeSession();

    return c.json(session);
  } catch (error) {
    console.error(error);

    return c.json({
      error: "Failed to create realtime session",
    });
  }
});

export default {
  port: 8787,
  fetch: app.fetch,
};

console.log("Backend running on http://localhost:8787");