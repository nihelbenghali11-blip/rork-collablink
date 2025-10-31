import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { updateUserProfile, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      website: z.string().url().optional(),
      avatar_url: z.string().url().optional(),
      instagram_url: z.string().url().optional(),
      tiktok_url: z.string().url().optional(),
      facebook_url: z.string().url().optional(),
      snapchat_url: z.string().url().optional(),
      primary_platform: z
        .enum(["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"])
        .optional(),
      followers_count: z.number().int().nonnegative().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updated = await updateUserProfile(ctx.userId!, input);

    await logAudit(ctx.userId!, "update", "users", ctx.userId!);

    return updated;
  });
