import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB } from "@/backend/db";

export default protectedProcedure.query(({ ctx }) => {
  const db = getDB();
  const activeCampaignIds = db.campaigns
    .filter((c) => c.owner_user_id === ctx.userId && c.status === "active" && c.deleted_at == null)
    .map((c) => c.id);
  const spent = db.collaborators
    .filter((co) => activeCampaignIds.includes(co.campaign_id) && co.deleted_at == null)
    .reduce((s, co) => s + co.agreed_amount, 0);
  return { totalSpentActiveCampaigns: spent };
});
