import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, id, saveDB } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      campaign_id: z.string(),
      ratee_user_id: z.string(),
      score: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const now = new Date().toISOString();
    const ratingId = id();
    db.ratings.push({ id: ratingId, campaign_id: input.campaign_id, rater_user_id: ctx.userId!, ratee_user_id: input.ratee_user_id, score: input.score, comment: input.comment, created_at: now });
    const ratings = db.ratings.filter((r) => r.ratee_user_id === input.ratee_user_id);
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;
    const u = db.users.find((x) => x.id === input.ratee_user_id);
    if (u) u.rating_avg = Number(avg.toFixed(2));
    saveDB();
    return { id: ratingId, rating_avg: u?.rating_avg ?? avg };
  });
