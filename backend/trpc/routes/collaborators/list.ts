import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ campaign_id: z.string() }))
  .query(({ input }) => {
    const db = getDB();
    const collaborators = db.collaborators.filter(
      (c) => c.campaign_id === input.campaign_id && c.deleted_at == null
    );
    return collaborators;
  });
