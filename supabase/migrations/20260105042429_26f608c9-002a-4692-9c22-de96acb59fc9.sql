-- Create a table for tracking client costs
CREATE TABLE public.client_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_costs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage client costs
CREATE POLICY "Admins can manage client costs"
  ON public.client_costs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));