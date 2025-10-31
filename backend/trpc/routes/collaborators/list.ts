import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { listCollaboratorsByCampaign } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ campaign_id: z.string() }))
  .query(async ({ input }) => {
    return listCollaboratorsByCampaign(input.campaign_id);
  });
