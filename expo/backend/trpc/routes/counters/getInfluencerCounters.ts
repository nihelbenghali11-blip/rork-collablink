import { protectedProcedure } from "@/backend/trpc/create-context";
import { getInfluencerCountersForUser } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  return getInfluencerCountersForUser(ctx.userId!);
});
