import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { sendMessageToConversation } from "@/backend/db";
import prisma from "@/backend/prisma";

export default protectedProcedure
  .input(
    z.object({
      conversation_id: z.string(),
      content: z.string().min(1),
      attachment: z
        .object({
          file_name: z.string(),
          mime_type: z.string(),
          size: z.number().int().nonnegative(),
          storage_url: z.string().url(),
        })
        .optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const res = await sendMessageToConversation({
      conversation_id: input.conversation_id,
      sender_user_id: ctx.userId!,
      content: input.content,
      attachment: input.attachment,
    });

    try {
      const conv = await prisma.conversation.findUnique({ where: { id: input.conversation_id } });
      if (conv) {
        const recipientId = conv.user_a_id === ctx.userId ? conv.user_b_id : conv.user_a_id;
        const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { expo_push_token: true, name: true } });
        if (recipient?.expo_push_token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipient.expo_push_token,
              title: 'New message',
              sound: 'default',
              body: input.content.slice(0, 140),
              data: { conversation_id: input.conversation_id },
            }),
          });
        }
      }
    } catch (e) {
      console.log('[Push] Failed to send push', e);
    }

    return res;
  });
