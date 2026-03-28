import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default protectedProcedure
  .input(z.object({ conversation_id: z.string() }))
  .query(async ({ ctx, input }) => {
    const conv = await prisma.conversation.findUnique({
      where: { id: input.conversation_id },
    });
    if (!conv || conv.deleted_at) {
      throw new Error("Conversation not found");
    }
    if (conv.user_a_id !== ctx.userId && conv.user_b_id !== ctx.userId) {
      throw new Error("Forbidden");
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: input.conversation_id, deleted_at: null },
      orderBy: { created_at: "asc" },
      include: { attachment: true },
    });

    return messages.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at.toISOString(),
      read_at: m.read_at ? m.read_at.toISOString() : null,
      attachment: m.attachment
        ? {
            id: m.attachment.id,
            file_name: m.attachment.file_name,
            mime_type: m.attachment.mime_type,
            size: m.attachment.size,
            storage_url: m.attachment.storage_url,
          }
        : null,
    }));
  });
