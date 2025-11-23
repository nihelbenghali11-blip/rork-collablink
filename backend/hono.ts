import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import prisma from "@/backend/prisma";

const app = new Hono();

// CORS: allow all origins
app.use(
  "*",
  cors({
    origin: "*", // allow all origins
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "ngrok-skip-browser-warning",
      "trpc-batch-mode",
    ],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  })
);

// Basic request logging
app.use("*", async (c, next) => {
  console.log(`[Backend] ${c.req.method} ${c.req.url}`);
  await next();
});

// tRPC mount
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Presence ping
app.post("/api/presence/ping", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ ok: false }, 401);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { updated_at: new Date() },
    });
  } catch (e) {
    console.log("[Presence] Update failed", e);
  }
  return c.json({ ok: true });
});

// Serve user avatar blob
app.get("/api/users/:id/avatar", async (c) => {
  const id = c.req.param("id");
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatar_blob: true, avatar_mime_type: true },
    });
    if (!user?.avatar_blob || !user.avatar_mime_type) {
      return c.json({ error: "Not found" }, 404);
    }
    return new Response(user.avatar_blob as any, {
      headers: {
        "Content-Type": user.avatar_mime_type,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    return c.json({ error: "Server error" }, 500);
  }
});

export default app;
