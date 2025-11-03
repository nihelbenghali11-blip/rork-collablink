import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import prisma from "@/backend/prisma";
import { genId } from "@/backend/db";

export default publicProcedure
  .input(
    z.object({
      role: z.enum(["brand", "influencer"]),
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6).optional().default("temp_password_123"),

      bio: z.string().optional(),
      sector: z.string().optional(),

      primary_platform: z
        .enum(["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"])
        .optional(),

      followers_count: z.number().optional(),

      instagram_url: z.string().optional(),
      tiktok_url: z.string().optional(),
      facebook_url: z.string().optional(),
      snapchat_url: z.string().optional(),

      website: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Register mutation called with:", {
      role: input.role,
      name: input.name,
      email: input.email,
    });

    const userId = genId();
    const now = new Date();

    console.log("[Backend] Checking for existing user with email:", input.email);

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      console.log(
        "[Backend] User already exists, returning existing user:",
        existingUser.id
      );

      // Return only fields your frontend actually reads
      return {
        id: existingUser.id,
        role: existingUser.role,
        name: existingUser.name,
        email: existingUser.email,
        bio: existingUser.bio,
        sector: existingUser.sector,
        created_at: existingUser.created_at,
      };
    }

    console.log("[Backend] Creating new user with ID:", userId);

    try {
      // minimal insert that is very unlikely to violate schema
      const user = await prisma.user.create({
        data: {
          id: userId,
          role: input.role,
          name: input.name,
          email: input.email,
          // assuming your schema has password_hash: String
          password_hash: input.password ?? "temp_password_123",

          bio: input.bio ?? null,
          sector: input.sector ?? null,

          // Influencer-specific fields
          primary_platform: input.primary_platform ?? null,
          followers_count: input.followers_count ?? null,
          instagram_url: input.instagram_url ?? null,
          tiktok_url: input.tiktok_url ?? null,
          facebook_url: input.facebook_url ?? null,
          snapchat_url: input.snapchat_url ?? null,

          // Brand-specific fields
          website: input.website ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,

          // timestamps. adjust the field names if your Prisma model uses createdAt / updatedAt instead
          created_at: now,
          updated_at: now,
        },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          bio: true,
          sector: true,
          followers_count: true,
          primary_platform: true,
          created_at: true,
        },
      });

      console.log(
        "[Backend] User created successfully in database:",
        user.id
      );

      return user;
    } catch (error) {
      console.error(
        "[Backend] Failed to create user in database:",
        error
      );
      // You rethrow so tRPC returns 500.
      // That's fine. The important part here is the console.error above.
      throw error;
    }
  });
