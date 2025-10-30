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
    try {
      console.log("[collaborators.create] Starting mutation with userId:", ctx.userId);
      console.log("[collaborators.create] Input:", JSON.stringify(input, null, 2));
      
      const db = getDB();
      const campaign = db.campaigns.find((c) => c.id === input.campaign_id && c.deleted_at == null);
      
      if (!campaign) {
        console.error("[collaborators.create] Campaign not found:", input.campaign_id);
        throw new Error("Campaign not found");
      }
      
      const collabId = id();
      const now = new Date().toISOString();
      const newCollaborator = { 
        id: collabId, 
        created_at: now, 
        updated_at: now, 
        deleted_at: null, 
        ...input 
      };
      
      console.log("[collaborators.create] Creating collaborator:", JSON.stringify(newCollaborator, null, 2));
      
      db.collaborators.push(newCollaborator);
      saveDB();
      logAudit(ctx.userId!, "create", "collaborators", collabId);
      
      console.log("[collaborators.create] Successfully created collaborator:", collabId);
      return { id: collabId };
    } catch (error) {
      console.error("[collaborators.create] Error:", error);
      throw error;
    }
  });
