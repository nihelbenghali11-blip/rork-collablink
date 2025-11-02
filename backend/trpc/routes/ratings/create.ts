import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";
import { addRatingRow } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      campaign_id: z.string(),
      ratee_user_id: z.string(),
      score: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: input.campaign_id } });
    if (!campaign || campaign.deleted_at || campaign.status !== "active") {
      throw new Error("Invalid campaign");
    }
    if (campaign.owner_user_id !== ctx.userId) {
      throw new Error("You can only rate from your own campaigns");
    }
    if (ctx.userId === input.ratee_user_id) {
      throw new Error("You cannot rate yourself");
    }

    const result = await addRatingRow({
      campaign_id: input.campaign_id,
      rater_user_id: ctx.userId!,
      ratee_user_id: input.ratee_user_id,
      score: input.score,
      comment: input.comment,
    });

    return result;
  });
