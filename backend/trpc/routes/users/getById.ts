import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        bio: true,
        sector: true,
        website: true,
        phone: true,
        address: true,
        avatar_url: true,
        avatar_blob: true,
        avatar_mime_type: true,
        rating_avg: true,
        primary_platform: true,
        followers_count: true,
        instagram_url: true,
        tiktok_url: true,
        facebook_url: true,
        snapchat_url: true,
        created_at: true,
      },
    });

    if (!user) return null;
    const avatar_data_url = user.avatar_blob && user.avatar_mime_type
      ? `data:${user.avatar_mime_type};base64,${Buffer.from(user.avatar_blob as any).toString("base64")}`
      : null;
    return { ...user, avatar_url: avatar_data_url || user.avatar_url } as any;
  });
