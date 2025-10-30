import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB } from "@/backend/db";

export default protectedProcedure.query(({ ctx }) => {
  const db = getDB();
  const active = db.campaigns.filter((c) => c.owner_user_id === ctx.userId && c.status === "active" && c.deleted_at == null);
  const proposedCount = active.length;
  const totalRevenue = active.reduce((s, c) => s + c.revenue_amount, 0);
  return { proposedCount, totalRevenue };
});
