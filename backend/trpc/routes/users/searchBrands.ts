import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default publicProcedure
  .input(
    z.object({
      q: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      cursor: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const where: any = { role: "brand" };

    if (input?.q) {
      const q = input.q;
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sector: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: input?.limit ?? 50,
      skip: input?.cursor ? 1 : 0,
      cursor: input?.cursor ? { id: input.cursor } : undefined,
      select: {
        id: true,
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
        email: u.email,
        bio: u.bio,
        sector: u.sector,
        website: u.website,
        phone: u.phone,
        address: u.address,
        avatar_url: dataUrl || u.avatar_url,
        rating_avg: u.rating_avg,
        created_at: u.created_at,
      };
    });

    const nextCursor = rows.length === (input?.limit ?? 50) ? rows[rows.length - 1].id : undefined;

    return { items: mapped, nextCursor };
  });
