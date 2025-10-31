import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "backend", "data", "db.json");

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
  campaigns: unknown[];
  collaborators: CollaboratorRecord[];
}

async function loadDB(): Promise<DBShape> {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DBShape;
    if (!parsed.collaborators) throw new Error("invalid");
    if (!parsed.campaigns) parsed.campaigns = [];
    return parsed;
  } catch {
    const initial: DBShape = { campaigns: [], collaborators: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function saveDB(db: DBShape) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const baseSchema = {
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(3),
  agreed_amount: z.number().nonnegative(),
  currency: z.string().min(1),
  ad_status: z.string().default("Active"),
};

export default createTRPCRouter({
  list: publicProcedure
    .input(z.object({ campaign_id: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await loadDB();
      return db.collaborators.filter((c) => c.campaign_id === input.campaign_id);
    }),
  create: publicProcedure
    .input(z.object({ campaign_id: z.string().min(1), ...baseSchema }))
    .mutation(async ({ input }) => {
      const db = await loadDB();
      const id = genId("col");
      const record: CollaboratorRecord = { id, ...input };
      db.collaborators.push(record);
      await saveDB(db);
      return { id };
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        phone: z.string().min(3),
        agreed_amount: z.number().nonnegative(),
        currency: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await loadDB();
      db.collaborators = db.collaborators.map((c) =>
        c.id === input.id
          ? {
              ...c,
              first_name: input.first_name,
              last_name: input.last_name,
              phone: input.phone,
              agreed_amount: input.agreed_amount,
              currency: input.currency,
            }
          : c
      );
      await saveDB(db);
      return { ok: true } as const;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await loadDB();
      db.collaborators = db.collaborators.filter((c) => c.id !== input.id);
      await saveDB(db);
      return { ok: true } as const;
    }),
});
