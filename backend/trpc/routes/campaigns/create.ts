import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, id, saveDB, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      brand_name: z.string().min(1),
      description: z.string().min(1),
      revenue_amount: z.number().positive(),
      revenue_currency: z.string().min(1),
      start_date: z.string().optional(),
      status: z.enum(["active", "closed"]).default("active"),
      platforms: z.array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
        .min(1),
    })
  )
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const campaignId = id();
    const now = new Date().toISOString();
    db.campaigns.push({
      id: campaignId,
      owner_user_id: ctx.userId!,
      name: input.name,
      brand_name: input.brand_name,
      description: input.description,
      revenue_amount: input.revenue_amount,
      revenue_currency: input.revenue_currency,
      start_date: input.start_date,
      status: input.status,
      created_at: now,
      updated_at: now,
    });
    for (const p of input.platforms) {
      db.campaign_platforms.push({ campaign_id: campaignId, platform: p });
    }
    saveDB();
    logAudit(ctx.userId!, "create", "campaigns", campaignId);
    return { id: campaignId };
  });
