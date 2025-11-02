import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";

export default publicProcedure
  .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
  .mutation(async ({ input }) => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new Error("User not found");
    }
    if ((user as any).password_hash !== input.password) {
      throw new Error("Invalid credentials");
    }
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      bio: user.bio,
      sector: user.sector,
      primary_platform: user.primary_platform,
      followers_count: user.followers_count ?? 0,
      created_at: user.created_at,
    };
  });