-- Add PricingTier enum and pricing fields to users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PricingTier') THEN
    CREATE TYPE "PricingTier" AS ENUM ('UNDER_1000', 'BETWEEN_1000_5000', 'ABOVE_5000');
  END IF;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "pricing_tier" "PricingTier",
  ADD COLUMN IF NOT EXISTS "pricing_currency" TEXT;
