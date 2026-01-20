-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add coupon reference to client_services
ALTER TABLE public.client_services 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons
CREATE POLICY "Anyone can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));