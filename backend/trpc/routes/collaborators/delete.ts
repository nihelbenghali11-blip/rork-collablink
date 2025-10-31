import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { softDeleteCollaboratorRow, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await softDeleteCollaboratorRow(input.id);
    await logAudit(ctx.userId!, "soft_delete", "collaborators", input.id);
    return { ok: true };
  });
