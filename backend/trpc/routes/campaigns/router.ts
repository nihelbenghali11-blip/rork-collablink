import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "backend", "data", "db.json");

type Platform = "Instagram" | "TikTok" | "Facebook" | "Snapchat";

interface CampaignRecord {
  id: string;
  name: string;
  brand_name: string;
  status: string;
  revenue_amount: number;
  revenue_currency: string;
  start_date: string;
  description: string;
  platforms: Platform[];
}

interface CollaboratorRecord {
  id: string;
  campaign_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  agreed_amount: number;
  currency: string;
  ad_status: string;
}

interface DBShape {
  campaigns: CampaignRecord[];
  collaborators: CollaboratorRecord[];
}

async function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: DBShape = { campaigns: [], collaborators: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function loadDB(): Promise<DBShape> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw) as DBShape;
    if (!parsed.campaigns || !parsed.collaborators) throw new Error("Invalid DB");
    return parsed;
  } catch (e) {
    const fallback: DBShape = { campaigns: [], collaborators: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function saveDB(db: DBShape) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const createInput = z.object({
  name: z.string().min(1),
  brand_name: z.string().min(1),
  status: z.string().default("active"),
  revenue_amount: z.number().nonnegative(),
  revenue_currency: z.string().min(1),
  start_date: z.string().min(1),
  description: z.string().default(""),
  platforms: z.array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"] as const)),
});

export default createTRPCRouter({
  create: publicProcedure.input(createInput).mutation(async ({ input }) => {
    const db = await loadDB();
    const id = genId("cmp");
    const record: CampaignRecord = { id, ...input };
    db.campaigns.push(record);
    await saveDB(db);
    return { id };
  }),
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const db = await loadDB();
    db.campaigns = db.campaigns.filter((c) => c.id !== input.id);
    db.collaborators = db.collaborators.filter((c) => c.campaign_id !== input.id);
    await saveDB(db);
    return { ok: true } as const;
  }),
  list: publicProcedure.query(async () => {
    const db = await loadDB();
    return db.campaigns;
  }),
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const db = await loadDB();
    return db.campaigns.find((c) => c.id === input.id) ?? null;
  }),
});
