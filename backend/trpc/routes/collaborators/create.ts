import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, id, saveDB, logAudit } from "@/backend/db";

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
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const campaign = db.campaigns.find((c) => c.id === input.campaign_id && c.deleted_at == null);
    if (!campaign) throw new Error("Campaign not found");
    const collabId = id();
    const now = new Date().toISOString();
    db.collaborators.push({ id: collabId, created_at: now, updated_at: now, deleted_at: null, ...input });
    saveDB();
    logAudit(ctx.userId!, "create", "collaborators", collabId);
    return { id: collabId };
  });
