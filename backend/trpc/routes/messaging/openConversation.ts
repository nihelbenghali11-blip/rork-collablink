import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { openOrCreateConversationWithUser } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ other_user_id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const conv = await openOrCreateConversationWithUser({
      userId: ctx.userId!,
      other_user_id: input.other_user_id,
    });
    return conv;
  });
