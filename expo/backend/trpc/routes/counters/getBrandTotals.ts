import { protectedProcedure } from "@/backend/trpc/create-context";
import { getBrandTotalsForUser } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  return getBrandTotalsForUser(ctx.userId!);
});
