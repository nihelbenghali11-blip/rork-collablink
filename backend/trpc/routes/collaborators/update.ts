import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, saveDB, logAudit } from "@/backend/db";

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
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const collab = db.collaborators.find((c) => c.id === input.id && c.deleted_at == null);
    if (!collab) throw new Error("Collaborator not found");
    
    Object.assign(collab, {
      ...input,
      updated_at: new Date().toISOString(),
    });
    
    saveDB();
    logAudit(ctx.userId!, "update", "collaborators", collab.id);
    return { ok: true };
  });
