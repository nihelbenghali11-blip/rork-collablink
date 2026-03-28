import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { updateCampaignRow, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      brand_name: z.string().min(1),
      description: z.string().min(1),
      revenue_amount: z.number().positive(),
      revenue_currency: z.string().min(1),
      start_date: z.string().optional().nullable(),
      status: z.enum(["active", "closed"]),
      platforms: z
        .array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
        .min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;

    const updated = await updateCampaignRow(id, {
      name: rest.name,
      brand_name: rest.brand_name,
      description: rest.description,
      revenue_amount: rest.revenue_amount,
      revenue_currency: rest.revenue_currency,
      start_date: rest.start_date ?? null,
      status: rest.status,
      platforms: rest.platforms,
    });

    await logAudit(ctx.userId!, "update", "campaigns", id);

    return updated;
  });
