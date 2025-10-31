import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { softDeleteCampaign, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await softDeleteCampaign(input.id);
    await logAudit(ctx.userId!, "soft_delete", "campaigns", input.id);
    return { ok: true };
  });
