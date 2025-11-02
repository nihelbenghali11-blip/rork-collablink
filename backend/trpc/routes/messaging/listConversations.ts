import { protectedProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default protectedProcedure.query(async ({ ctx }) => {
  const rows = await prisma.conversation.findMany({
    where: {
      deleted_at: null,
      OR: [{ user_a_id: ctx.userId! }, { user_b_id: ctx.userId! }],
    },
    orderBy: { updated_at: "desc" },
    include: {
      userA: { select: { id: true, name: true, avatar_url: true, updated_at: true } },
      userB: { select: { id: true, name: true, avatar_url: true, updated_at: true } },
    },
  });
  return rows.map((r: any) => ({
    id: r.id,
    user_a_id: r.user_a_id,
    user_b_id: r.user_b_id,
    last_message_at: r.last_message_at ? r.last_message_at.toISOString() : null,
    unread_a: r.unread_a ?? 0,
    unread_b: r.unread_b ?? 0,
    created_at: r.created_at?.toISOString?.() ?? null,
    updated_at: r.updated_at?.toISOString?.() ?? null,
    userA: { id: r.userA.id, name: r.userA.name, avatar_url: r.userA.avatar_url, updated_at: r.userA.updated_at?.toISOString?.() ?? null },
    userB: { id: r.userB.id, name: r.userB.name, avatar_url: r.userB.avatar_url, updated_at: r.userB.updated_at?.toISOString?.() ?? null },
  }));
});
