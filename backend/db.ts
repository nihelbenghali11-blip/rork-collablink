import prisma from "./prisma";

const now = () => new Date();

export const genId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/*
 * USERS
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function updateUserProfile(
  userId: string,
  patch: {
    name?: string;
    email?: string;
    bio?: string;
    phone?: string;
    address?: string;
    website?: string;
    avatar_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    facebook_url?: string;
    snapchat_url?: string;
    primary_platform?: string;
    followers_count?: number;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...patch,
      updated_at: now(),
    },
  });
}

/*
 * AUDIT LOGS
 */
export async function logAudit(
  user_id: string,
  action: string,
  entity: string,
  entity_id: string
) {
  await prisma.auditLog.create({
    data: {
      id: genId(),
      user_id,
      action,
      entity,
      entity_id,
      created_at: now(),
    },
  });
}

/*
 * CAMPAIGNS
 */
export async function createCampaignWithPlatforms(params: {
  owner_user_id: string;
  name: string;
  brand_name: string;
  description: string;
  revenue_amount: number;
  revenue_currency: string;
  start_date?: string;
  status: "active" | "closed";
  platforms: ("Instagram" | "TikTok" | "Facebook" | "Snapchat")[];
}) {
  const t = now();
  const campaignId = genId();

  await prisma.campaign.create({
    data: {
      id: campaignId,
      owner_user_id: params.owner_user_id,
      name: params.name,
      brand_name: params.brand_name,
      description: params.description,
      revenue_amount: params.revenue_amount,
      revenue_currency: params.revenue_currency,
      start_date: params.start_date ?? null,
      status: params.status,
      created_at: t,
      updated_at: t,
      deleted_at: null,
    },
  });

  if (params.platforms.length > 0) {
    await prisma.campaignPlatform.createMany({
      data: params.platforms.map((p) => ({
        campaign_id: campaignId,
        platform: p,
        created_at: t,
        updated_at: t,
      })),
    });
  }

  return campaignId;
}

export async function getCampaignById(campaignId: string) {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      platforms: true,
      collaborators: true,
      ratings: true,
    },
  });
}

export async function listActiveCampaignsByOwner(owner_user_id: string) {
  return prisma.campaign.findMany({
    where: {
      owner_user_id,
      status: "active",
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
    include: {
      platforms: true,
    },
  });
}

export async function updateCampaignRow(
  campaignId: string,
  patch: {
    name?: string;
    brand_name?: string;
    description?: string;
    revenue_amount?: number;
    revenue_currency?: string;
    start_date?: string | null;
    status?: "active" | "closed";
    platforms?: ("Instagram" | "TikTok" | "Facebook" | "Snapchat")[];
  }
) {
  const t = now();

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: patch.name,
      brand_name: patch.brand_name,
      description: patch.description,
      revenue_amount: patch.revenue_amount,
      revenue_currency: patch.revenue_currency,
      start_date: patch.start_date,
      status: patch.status,
      updated_at: t,
    },
  });

  if (patch.platforms) {
    await prisma.campaignPlatform.deleteMany({
      where: { campaign_id: campaignId },
    });
    await prisma.campaignPlatform.createMany({
      data: patch.platforms.map((p) => ({
        campaign_id: campaignId,
        platform: p,
        created_at: t,
        updated_at: t,
      })),
    });
  }

  return updated;
}

export async function softDeleteCampaign(campaignId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      deleted_at: now(),
    },
  });
}

/*
 * COLLABORATORS
 */
export async function createCollaborator(params: {
  campaign_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  agreed_amount: number;
  currency: string;
  ad_status: "Active" | "Terminée";
}) {
  const t = now();
  const collabId = genId();

  const row = await prisma.collaborator.create({
    data: {
      id: collabId,
      campaign_id: params.campaign_id,
      first_name: params.first_name,
      last_name: params.last_name,
      phone: params.phone,
      agreed_amount: params.agreed_amount,
      currency: params.currency,
      ad_status: params.ad_status,
      created_at: t,
      updated_at: t,
      deleted_at: null,
    },
  });

  return row;
}

export async function listCollaboratorsByCampaign(campaign_id: string) {
  return prisma.collaborator.findMany({
    where: {
      campaign_id,
      deleted_at: null,
    },
    orderBy: { created_at: "asc" },
  });
}

export async function updateCollaboratorRow(
  collabId: string,
  patch: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    agreed_amount?: number;
    currency?: string;
    ad_status?: "Active" | "Terminée";
  }
) {
  return prisma.collaborator.update({
    where: { id: collabId },
    data: {
      ...patch,
      updated_at: now(),
    },
  });
}

export async function softDeleteCollaboratorRow(collabId: string) {
  await prisma.collaborator.update({
    where: { id: collabId },
    data: {
      deleted_at: now(),
    },
  });
}

/*
 * CONVERSATIONS / MESSAGES
 */
export async function listConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: {
      deleted_at: null,
      OR: [
        { user_a_id: userId },
        { user_b_id: userId },
      ],
    },
    orderBy: { updated_at: "desc" },
  });
}

export async function openOrCreateConversationWithUser(params: {
  userId: string;
  other_user_id: string;
}) {
  const { userId, other_user_id } = params;

  const existing = await prisma.conversation.findFirst({
    where: {
      deleted_at: null,
      OR: [
        { user_a_id: userId, user_b_id: other_user_id },
        { user_a_id: other_user_id, user_b_id: userId },
      ],
    },
  });

  if (existing) return existing;

  const t = now();
  const convId = genId();

  const conv = await prisma.conversation.create({
    data: {
      id: convId,
      user_a_id: userId,
      user_b_id: other_user_id,
      last_message_at: null,
      unread_a: 0,
      unread_b: 0,
      created_at: t,
      updated_at: t,
      deleted_at: null,
    },
  });

  return conv;
}

export async function sendMessageToConversation(params: {
  conversation_id: string;
  sender_user_id: string;
  content: string;
  attachment?: {
    file_name: string;
    mime_type: string;
    size: number;
    storage_url: string;
  };
}) {
  const conv = await prisma.conversation.findUnique({
    where: { id: params.conversation_id },
  });
  if (!conv || conv.deleted_at) {
    throw new Error("Conversation not found");
  }

  const t = now();
  let attachment_id: string | null = null;

  if (params.attachment) {
    attachment_id = genId();
    await prisma.attachment.create({
      data: {
        id: attachment_id,
        file_name: params.attachment.file_name,
        mime_type: params.attachment.mime_type,
        size: params.attachment.size,
        storage_url: params.attachment.storage_url,
        created_at: t,
      },
    });
  }

  const messageId = genId();

  await prisma.message.create({
    data: {
      id: messageId,
      conversation_id: conv.id,
      sender_id: params.sender_user_id,
      content: params.content,
      attachment_id: attachment_id,
      created_at: t,
      read_at: null,
      deleted_at: null,
    },
  });

  const updateData: any = {
    last_message_at: t,
    updated_at: t,
  };

  if (params.sender_user_id === conv.user_a_id) {
    updateData.unread_b = (conv.unread_b ?? 0) + 1;
  } else {
    updateData.unread_a = (conv.unread_a ?? 0) + 1;
  }

  await prisma.conversation.update({
    where: { id: conv.id },
    data: updateData,
  });

  return { id: messageId };
}

/*
 * RATINGS
 */
export async function addRatingRow(params: {
  campaign_id: string;
  rater_user_id: string;
  ratee_user_id: string;
  score: number;
  comment?: string | null;
}) {
  const t = now();
  const ratingId = genId();

  await prisma.rating.create({
    data: {
      id: ratingId,
      campaign_id: params.campaign_id,
      rater_user_id: params.rater_user_id,
      ratee_user_id: params.ratee_user_id,
      score: params.score,
      comment: params.comment ?? null,
      created_at: t,
    },
  });

  const ratings = await prisma.rating.findMany({
    where: { ratee_user_id: params.ratee_user_id },
    select: { score: true },
  });

  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : 0;

  const rounded = Number(avg.toFixed(2));

  await prisma.user.update({
    where: { id: params.ratee_user_id },
    data: { rating_avg: rounded, updated_at: t },
  });

  return { id: ratingId, rating_avg: rounded };
}

/*
 * COUNTERS / STATS
 */
export async function getInfluencerCountersForUser(userId: string) {
  const active = await prisma.campaign.findMany({
    where: {
      owner_user_id: userId,
      status: "active",
      deleted_at: null,
    },
    select: {
      revenue_amount: true,
    },
  });

  const proposedCount = active.length;
  const totalRevenue = active.reduce(
    (sum, c) => sum + (c.revenue_amount ?? 0),
    0
  );

  return { proposedCount, totalRevenue };
}

export async function getBrandTotalsForUser(userId: string) {
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      owner_user_id: userId,
      status: "active",
      deleted_at: null,
    },
    select: { id: true },
  });

  const activeIds = activeCampaigns.map((c) => c.id);

  if (activeIds.length === 0) {
    return { totalSpentActiveCampaigns: 0 };
  }

  const collaborators = await prisma.collaborator.findMany({
    where: {
      campaign_id: { in: activeIds },
      deleted_at: null,
    },
    select: { agreed_amount: true },
  });

  const spent = collaborators.reduce(
    (s, co) => s + co.agreed_amount,
    0
  );

  return { totalSpentActiveCampaigns: spent };
}
