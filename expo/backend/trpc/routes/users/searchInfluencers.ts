import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default publicProcedure
  .input(
    z.object({
      q: z.string().optional(),
      platform: z
        .enum(["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"]) 
        .optional(),
      sortFollowers: z.enum(["asc", "desc"]).optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      cursor: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const where: any = { role: "influencer" };

    if (input?.q) {
      const q = input.q;
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { sector: { contains: q, mode: "insensitive" } },
      ];
    }

    if (input?.platform) {
      where.primary_platform = input.platform;
    }

    const orderBy = input?.sortFollowers
      ? { followers_count: input.sortFollowers }
      : { created_at: "desc" as const };

    const rows = await prisma.user.findMany({
      where,
      orderBy,
      take: input?.limit ?? 50,
      skip: input?.cursor ? 1 : 0,
      cursor: input?.cursor ? { id: input.cursor } : undefined,
      select: {
        id: true,
        name: true,
        bio: true,
        avatar_url: true,
        avatar_blob: true,
        avatar_mime_type: true,
        primary_platform: true,
        followers_count: true,
        rating_avg: true,
        instagram_url: true,
        tiktok_url: true,
        facebook_url: true,
        snapchat_url: true,
        pricing_tier: true,
        pricing_currency: true,
        created_at: true,
      },
    });

    const mapped = rows.map((u: any) => {
      const dataUrl = u.avatar_blob && u.avatar_mime_type
        ? `data:${u.avatar_mime_type};base64,${Buffer.from(u.avatar_blob as any).toString("base64")}`
        : null;
      return {
        id: u.id,
        name: u.name,
        bio: u.bio,
        avatar_url: dataUrl || u.avatar_url,
        primary_platform: u.primary_platform,
        followers_count: u.followers_count,
        rating_avg: u.rating_avg,
        instagram_url: u.instagram_url,
        tiktok_url: u.tiktok_url,
        facebook_url: u.facebook_url,
        snapchat_url: u.snapchat_url,
        pricing_tier: u.pricing_tier,
        pricing_currency: u.pricing_currency,
        created_at: u.created_at,
      };
    });

    const nextCursor = rows.length === (input?.limit ?? 50) ? rows[rows.length - 1].id : undefined;

    return { items: mapped, nextCursor };
  });
