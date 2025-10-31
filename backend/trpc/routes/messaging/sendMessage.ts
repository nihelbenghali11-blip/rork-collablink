import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { sendMessageToConversation } from "@/backend/db";

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

    return res;
  });
