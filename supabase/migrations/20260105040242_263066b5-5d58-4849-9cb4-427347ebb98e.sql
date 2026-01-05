-- Add artificial_clients column to monthly_capacity table
ALTER TABLE public.monthly_capacity
ADD COLUMN artificial_clients integer NOT NULL DEFAULT 0;