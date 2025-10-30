import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, saveDB, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const c = db.campaigns.find((x) => x.id === input.id && x.owner_user_id === ctx.userId);
    if (!c) throw new Error("Campaign not found");
    c.deleted_at = new Date().toISOString();
    saveDB();
    logAudit(ctx.userId!, "soft_delete", "campaigns", c.id);
    return { ok: true };
  });
