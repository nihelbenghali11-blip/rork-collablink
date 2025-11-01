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
      primary_platform: z.enum(["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"]).optional(),
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
      console.log("[Backend] User already exists, returning existing user:", existingUser.id);
      return {
        id: existingUser.id,
        role: existingUser.role,
        name: existingUser.name,
        email: existingUser.email,
        bio: existingUser.bio,
        sector: existingUser.sector,
        primary_platform: existingUser.primary_platform,
        followers_count: existingUser.followers_count,
        instagram_url: existingUser.instagram_url,
        tiktok_url: existingUser.tiktok_url,
        facebook_url: existingUser.facebook_url,
        snapchat_url: existingUser.snapchat_url,
        website: existingUser.website,
        phone: existingUser.phone,
        address: existingUser.address,
        rating_avg: existingUser.rating_avg,
        created_at: existingUser.created_at,
      };
    }

    console.log("[Backend] Creating new user with ID:", userId);
    try {
      const user = await prisma.user.create({
        data: {
          id: userId,
          role: input.role,
          name: input.name,
          email: input.email,
          password_hash: input.password,
          bio: input.bio ?? null,
          sector: input.sector ?? null,
          primary_platform: input.primary_platform ?? null,
          followers_count: input.followers_count ?? null,
          instagram_url: input.instagram_url ?? null,
          tiktok_url: input.tiktok_url ?? null,
          facebook_url: input.facebook_url ?? null,
          snapchat_url: input.snapchat_url ?? null,
          website: input.website ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          avatar_url: null,
          default_currency: "EUR",
          rating_avg: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      });

      console.log("[Backend] User created successfully in database:", user.id);

      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        bio: user.bio,
        sector: user.sector,
        primary_platform: user.primary_platform,
        followers_count: user.followers_count,
        instagram_url: user.instagram_url,
        tiktok_url: user.tiktok_url,
        facebook_url: user.facebook_url,
        snapchat_url: user.snapchat_url,
        website: user.website,
        phone: user.phone,
        address: user.address,
        rating_avg: user.rating_avg,
        created_at: user.created_at,
      };
    } catch (error) {
      console.error("[Backend] Failed to create user in database:", error);
      throw error;
    }
  });
