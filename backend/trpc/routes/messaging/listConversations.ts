import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB } from "@/backend/db";

export default protectedProcedure.query(({ ctx }) => {
  const db = getDB();
  return db.conversations.filter(
    (c) => (c.user_a_id === ctx.userId || c.user_b_id === ctx.userId) && c.deleted_at == null
  );
});
