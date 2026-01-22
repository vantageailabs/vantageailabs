-- Create table for BOS builder submissions
CREATE TABLE public.bos_builder_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  business_name TEXT,
  selected_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_price NUMERIC NOT NULL DEFAULT 0,
  estimated_hours_saved NUMERIC NOT NULL DEFAULT 0,
  suggested_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bos_builder_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (lead capture form)
CREATE POLICY "Allow anonymous inserts" 
ON public.bos_builder_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view all submissions" 
ON public.bos_builder_submissions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));