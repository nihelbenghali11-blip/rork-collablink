import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB } from "@/backend/db";

export default protectedProcedure.query(({ ctx }) => {
  const db = getDB();
  return db.campaigns.filter(
    (c) => c.owner_user_id === ctx.userId && c.deleted_at == null && c.status === "active"
  );
});
