import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
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
    const result = await addRatingRow({
      campaign_id: input.campaign_id,
      rater_user_id: ctx.userId!,
      ratee_user_id: input.ratee_user_id,
      score: input.score,
      comment: input.comment,
    });

    return result;
  });
