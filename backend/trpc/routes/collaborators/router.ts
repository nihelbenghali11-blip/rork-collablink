import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import {
  listCollaboratorsByCampaign,
  createCollaborator,
  updateCollaboratorRow,
  softDeleteCollaboratorRow,
} from "@/backend/db";

export default createTRPCRouter({
  list: publicProcedure
    .input(z.object({ campaign_id: z.string().min(1) }))
    .query(async ({ input }) => {
      return listCollaboratorsByCampaign(input.campaign_id);
    }),

  create: publicProcedure
    .input(
      z.object({
        campaign_id: z.string().min(1),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        phone: z.string().optional(),
        agreed_amount: z.number().nonnegative(),
        currency: z.string().min(1),
        ad_status: z.enum(["Active", "Terminée"]).default("Active"),
      })
    )
    .mutation(async ({ input }) => {
      const row = await createCollaborator({
        campaign_id: input.campaign_id,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        agreed_amount: input.agreed_amount,
        currency: input.currency,
        ad_status: input.ad_status ?? "Active",
      });
      return { id: row.id };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        first_name: z.string().min(1).optional(),
        last_name: z.string().min(1).optional(),
        phone: z.string().optional(),
        agreed_amount: z.number().nonnegative().optional(),
        currency: z.string().min(1).optional(),
        ad_status: z.enum(["Active", "Terminée"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...patch } = input;
      const updated = await updateCollaboratorRow(id, patch);
      return { ok: true, collaborator: updated };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await softDeleteCollaboratorRow(input.id);
      return { ok: true };
    }),
});
