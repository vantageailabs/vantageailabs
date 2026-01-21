-- Add column to store per-feature quotes as JSONB
-- Structure: { "feature_name": price, ... }
ALTER TABLE public.feature_requests 
ADD COLUMN feature_quotes jsonb DEFAULT '{}'::jsonb;

-- Add column to store applied coupon
ALTER TABLE public.feature_requests 
ADD COLUMN coupon_id uuid REFERENCES public.coupons(id);

-- Add column to store the discount percentage that was applied
ALTER TABLE public.feature_requests 
ADD COLUMN applied_discount_percent numeric DEFAULT 0;