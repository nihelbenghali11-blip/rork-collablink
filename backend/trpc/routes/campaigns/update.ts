import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, saveDB, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      brand_name: z.string().min(1),
      description: z.string().min(1),
      revenue_amount: z.number().positive(),
      revenue_currency: z.string().min(1),
      start_date: z.string().optional(),
      status: z.enum(["active", "closed"]),
      platforms: z.array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
        .min(1),
    })
  )
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const c = db.campaigns.find((x) => x.id === input.id && x.owner_user_id === ctx.userId);
    if (!c) throw new Error("Campaign not found");
    Object.assign(c, {
      name: input.name,
      brand_name: input.brand_name,
      description: input.description,
      revenue_amount: input.revenue_amount,
      revenue_currency: input.revenue_currency,
      start_date: input.start_date,
      status: input.status,
      updated_at: new Date().toISOString(),
    });
    db.campaign_platforms = db.campaign_platforms.filter((cp) => cp.campaign_id !== c.id);
    for (const p of input.platforms) db.campaign_platforms.push({ campaign_id: c.id, platform: p });
    saveDB();
    logAudit(ctx.userId!, "update", "campaigns", c.id);
    return c;
  });
