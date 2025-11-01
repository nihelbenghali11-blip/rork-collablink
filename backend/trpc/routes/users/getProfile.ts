import { protectedProcedure } from "@/backend/trpc/create-context";
import { getUserById } from "@/backend/db";

export default protectedProcedure.query(async ({ ctx }) => {
  const user = await getUserById(ctx.userId!);
  
  if (!user) {
    return null;
  }

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
    avatar_url: user.avatar_url,
    rating_avg: user.rating_avg,
    created_at: user.created_at,
  };
});
