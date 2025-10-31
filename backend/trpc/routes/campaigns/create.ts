import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { createCampaignWithPlatforms, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      brand_name: z.string().min(1),
      description: z.string().optional().default(""),
      revenue_amount: z.number().positive(),
      revenue_currency: z.string().min(1),
      start_date: z.string().optional(),
      status: z.enum(["active", "closed"]).default("active"),
      platforms: z
        .array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
        .min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const campaignId = await createCampaignWithPlatforms({
      owner_user_id: ctx.userId!,
      name: input.name,
      brand_name: input.brand_name,
      description: input.description ?? "",
      revenue_amount: input.revenue_amount,
      revenue_currency: input.revenue_currency,
      start_date: input.start_date,
      status: input.status,
      platforms: input.platforms,
    });

    await logAudit(ctx.userId!, "create", "campaigns", campaignId);

    return { id: campaignId };
  });
