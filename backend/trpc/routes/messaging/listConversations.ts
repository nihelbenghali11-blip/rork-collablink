import { protectedProcedure } from "@/backend/trpc/create-context";
import { listConversationsForUser } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  const rows = await listConversationsForUser(ctx.userId!);
  return rows.map((r: any) => ({
    id: r.id,
    user_a_id: r.user_a_id,
    user_b_id: r.user_b_id,
    last_message_at: r.last_message_at ? r.last_message_at.toISOString() : null,
    unread_a: r.unread_a ?? 0,
    unread_b: r.unread_b ?? 0,
    created_at: r.created_at?.toISOString?.() ?? null,
    updated_at: r.updated_at?.toISOString?.() ?? null,
  }));
});
