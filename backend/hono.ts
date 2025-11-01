import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

// CORS for Expo / ngrok
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  })
);

// Basic request logging
app.use("*", async (c, next) => {
  console.log(`[Backend] ${c.req.method} ${c.req.url}`);
  await next();
});

// tRPC mount at /trpc/*
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

export default app;
