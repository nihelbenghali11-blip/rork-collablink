import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, id, saveDB } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      conversation_id: z.string(),
      content: z.string().min(1),
      attachment: z
        .object({ file_name: z.string(), mime_type: z.string(), size: z.number().int().nonnegative(), storage_url: z.string().url() })
        .optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const conv = db.conversations.find((c) => c.id === input.conversation_id && c.deleted_at == null);
    if (!conv) throw new Error("Conversation not found");
    const now = new Date().toISOString();
    let attachment_id: string | undefined;
    if (input.attachment) {
      attachment_id = id();
      db.attachments.push({ id: attachment_id, ...input.attachment, created_at: now });
    }
    const messageId = id();
    db.messages.push({
      id: messageId,
      conversation_id: conv.id,
      sender_id: ctx.userId!,
      content: input.content,
      attachment_id,
      created_at: now,
      read_at: null,
      deleted_at: null,
    });
    conv.last_message_at = now;
    conv.updated_at = now;
    if (ctx.userId === conv.user_a_id) conv.unread_b = (conv.unread_b ?? 0) + 1;
    else conv.unread_a = (conv.unread_a ?? 0) + 1;
    saveDB();
    return { id: messageId };
  });
