import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { setUserAvatarBlob, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      base64: z.string().min(1),
      mime_type: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updated = await setUserAvatarBlob({
      userId: ctx.userId!,
      base64: input.base64,
      mime_type: input.mime_type,
    });

    await logAudit(ctx.userId!, "update_avatar", "users", ctx.userId!);

    return { success: true };
  });
