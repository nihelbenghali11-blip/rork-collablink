import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import {
  createCampaignWithPlatforms,
  updateCampaignRow,
  softDeleteCampaign,
  listActiveCampaignsByOwner,
  getCampaignById,
} from "@/backend/db";

export default createTRPCRouter({
  list: publicProcedure
    .input(z.object({ owner_user_id: z.string().min(1) }))
    .query(async ({ input }) => {
      return listActiveCampaignsByOwner(input.owner_user_id);
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      return getCampaignById(input.id);
    }),

  create: publicProcedure
    .input(
      z.object({
        owner_user_id: z.string().min(1),
        name: z.string().min(1),
        brand_name: z.string().min(1),
        description: z.string().min(1),
        revenue_amount: z.number().nonnegative(),
        revenue_currency: z.string().min(1),
        start_date: z.string().optional(),
        status: z.enum(["active", "closed"]),
        platforms: z
          .array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
          .min(1),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createCampaignWithPlatforms({
        owner_user_id: input.owner_user_id,
        name: input.name,
        brand_name: input.brand_name,
        description: input.description,
        revenue_amount: input.revenue_amount,
        revenue_currency: input.revenue_currency,
        start_date: input.start_date,
        status: input.status,
        platforms: input.platforms,
      });
      return { id };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        brand_name: z.string().min(1),
        description: z.string().min(1),
        revenue_amount: z.number().nonnegative(),
        revenue_currency: z.string().min(1),
        start_date: z.string().optional().nullable(),
        status: z.enum(["active", "closed"]),
        platforms: z
          .array(z.enum(["Instagram", "TikTok", "Facebook", "Snapchat"]))
          .min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const updated = await updateCampaignRow(id, {
        name: rest.name,
        brand_name: rest.brand_name,
        description: rest.description,
        revenue_amount: rest.revenue_amount,
        revenue_currency: rest.revenue_currency,
        start_date: rest.start_date ?? null,
        status: rest.status,
        platforms: rest.platforms,
      });
      return { ok: true, campaign: updated };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await softDeleteCampaign(input.id);
      return { ok: true };
    }),
});
