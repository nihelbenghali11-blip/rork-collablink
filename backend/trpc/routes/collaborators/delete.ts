import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, saveDB, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const collab = db.collaborators.find((c) => c.id === input.id);
    if (!collab) throw new Error("Collaborator not found");
    collab.deleted_at = new Date().toISOString();
    saveDB();
    logAudit(ctx.userId!, "soft_delete", "collaborators", collab.id);
    return { ok: true };
  });
