import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { createCollaborator, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      campaign_id: z.string(),
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      phone: z.string().optional(),
      agreed_amount: z.number().nonnegative(),
      currency: z.string().min(1),
      ad_status: z.enum(["Active", "Terminée"]).default("Active"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const row = await createCollaborator({
      campaign_id: input.campaign_id,
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      agreed_amount: input.agreed_amount,
      currency: input.currency,
      ad_status: input.ad_status ?? "Active",
    });

    await logAudit(ctx.userId!, "create", "collaborators", row.id);

    return { id: row.id };
  });
