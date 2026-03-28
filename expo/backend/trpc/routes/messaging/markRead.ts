import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default protectedProcedure
  .input(z.object({ conversation_id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const conv = await prisma.conversation.findUnique({ where: { id: input.conversation_id } });
    if (!conv || conv.deleted_at) {
      throw new Error("Conversation not found");
    }
    if (conv.user_a_id !== ctx.userId && conv.user_b_id !== ctx.userId) {
      throw new Error("Forbidden");
    }

    const isA = conv.user_a_id === ctx.userId;

    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: input.conversation_id },
        data: isA ? { unread_a: 0 } : { unread_b: 0 },
      }),
      prisma.message.updateMany({
        where: {
          conversation_id: input.conversation_id,
          sender_id: isA ? conv.user_b_id : conv.user_a_id,
          read_at: null,
        },
        data: { read_at: new Date() },
      }),
    ]);

    return { success: true };
  });