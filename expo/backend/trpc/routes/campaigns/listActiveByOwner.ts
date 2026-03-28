import { protectedProcedure } from "@/backend/trpc/create-context";
import { listActiveCampaignsByOwner } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  return listActiveCampaignsByOwner(ctx.userId!);
});
