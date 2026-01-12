-- Add explicit SELECT policy for clients table
-- The clients table contains sensitive PII and should only be readable by admins
-- This follows defense-in-depth security principles

CREATE POLICY "Admins can view clients"
ON public.clients
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));