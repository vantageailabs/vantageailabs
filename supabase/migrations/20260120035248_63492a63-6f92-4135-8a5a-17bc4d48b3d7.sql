-- Add referral_code column to clients table
ALTER TABLE public.clients 
ADD COLUMN referral_code TEXT UNIQUE DEFAULT NULL;

-- Create referrals table to track referral usage
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  referred_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  referral_code_used TEXT NOT NULL,
  referred_name TEXT,
  referred_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_type TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Admins can manage all referrals
CREATE POLICY "Admins can manage referrals"
ON public.referrals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_client_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code_used);