import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { getDB, saveDB, logAudit } from "@/backend/db";

export default protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      website: z.string().url().optional(),
      avatar_url: z.string().url().optional(),
      instagram_url: z.string().url().optional(),
      tiktok_url: z.string().url().optional(),
      facebook_url: z.string().url().optional(),
      snapchat_url: z.string().url().optional(),
      primary_platform: z.enum(["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"]).optional(),
      followers_count: z.number().int().nonnegative().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const db = getDB();
    const u = db.users.find((x) => x.id === ctx.userId);
    if (!u) throw new Error("User not found");
    Object.assign(u, { ...input, updated_at: new Date().toISOString() });
    saveDB();
    logAudit(ctx.userId!, "update", "users", ctx.userId!);
    return u;
  });
