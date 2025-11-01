import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  credentials: true,
}));

app.use("*", async (c, next) => {
  console.log(`[Backend] ${c.req.method} ${c.req.url}`);
  await next();
});

// Mount tRPC at /api/trpc to match the client url
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api/health", (c) => {
  console.log("[Backend] Health check called");
  return c.json({ 
    status: "ok", 
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test", (c) => {
  console.log("[Backend] Test endpoint called");
  return c.json({ 
    status: "ok", 
    message: "Test endpoint working",
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  });
});

export default app;
