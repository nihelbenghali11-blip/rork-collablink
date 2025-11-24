export type PricingTier = "UNDER_1000" | "BETWEEN_1000_5000" | "ABOVE_5000";
export type PricingBadge = "accessible" | "medium" | "premium";

export const PRICING_TIER_META: Record<PricingTier, { badge: PricingBadge; rangeKey: string }> = {
  UNDER_1000: { badge: "accessible", rangeKey: "pricing.under1k" },
  BETWEEN_1000_5000: { badge: "medium", rangeKey: "pricing.between1k5k" },
  ABOVE_5000: { badge: "premium", rangeKey: "pricing.over5k" },
};

export const PRICING_BADGE_LABEL_KEYS: Record<PricingBadge, string> = {
  accessible: "pricing.accessible",
  medium: "pricing.medium",
  premium: "pricing.premium",
};

export const PRICING_BADGE_COLORS: Record<PricingBadge, { background: string; text: string }> = {
  accessible: { background: "#ECFDF5", text: "#059669" },
  medium: { background: "#EEF2FF", text: "#4C1D95" },
  premium: { background: "#FEF3C7", text: "#B45309" },
};

export const pricingTierOrder: PricingTier[] = [
  "UNDER_1000",
  "BETWEEN_1000_5000",
  "ABOVE_5000",
];

export const pricingBadgeOrder: PricingBadge[] = ["accessible", "medium", "premium"];

export function getBadgeFromTier(tier?: PricingTier | null): PricingBadge | null {
  if (!tier) return null;
  return PRICING_TIER_META[tier].badge;
}

export function getTierFromBadge(badge: PricingBadge): PricingTier {
  const match = Object.entries(PRICING_TIER_META).find(([, meta]) => meta.badge === badge);
  return (match?.[0] as PricingTier) ?? "UNDER_1000";
}

export function getRangeKeyFromTier(tier?: PricingTier | null): string | null {
  if (!tier) return null;
  return PRICING_TIER_META[tier].rangeKey;
}
