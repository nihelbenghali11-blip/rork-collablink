import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { updateCollaboratorRow, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      id: z.string(),
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1).optional(),
      phone: z.string().optional(),
      agreed_amount: z.number().nonnegative().optional(),
      currency: z.string().min(1).optional(),
      ad_status: z.enum(["Active", "Terminée"]).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, ...patch } = input;

    const updated = await updateCollaboratorRow(id, patch);

    await logAudit(ctx.userId!, "update", "collaborators", id);

    return { ok: true, collaborator: updated };
  });
