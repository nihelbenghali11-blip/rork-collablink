import { serve } from "@hono/node-server";
import app from "./hono";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`API listening on http://localhost:${PORT}`);
