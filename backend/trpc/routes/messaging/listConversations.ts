import { protectedProcedure } from "@/backend/trpc/create-context";
import { listConversationsForUser } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  return listConversationsForUser(ctx.userId!);
});
