import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, id, saveDB } from "@/backend/db";

export default protectedProcedure
  .input(z.object({ other_user_id: z.string() }))
  .mutation(({ ctx, input }) => {
    const db = getDB();
    let conv = db.conversations.find(
      (c) =>
        ((c.user_a_id === ctx.userId && c.user_b_id === input.other_user_id) ||
          (c.user_b_id === ctx.userId && c.user_a_id === input.other_user_id)) &&
        c.deleted_at == null
    );
    if (!conv) {
      const now = new Date().toISOString();
      conv = {
        id: id(),
        user_a_id: ctx.userId!,
        user_b_id: input.other_user_id,
        last_message_at: undefined,
        unread_a: 0,
        unread_b: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      db.conversations.push(conv);
      saveDB();
    }
    return conv;
  });
