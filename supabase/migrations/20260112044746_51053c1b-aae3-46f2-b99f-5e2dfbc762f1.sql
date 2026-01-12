-- Fix the SECURITY DEFINER view issue by recreating with explicit SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user
DROP VIEW IF EXISTS public.appointment_availability;

CREATE VIEW public.appointment_availability 
WITH (security_invoker = true) AS
SELECT appointment_date, appointment_time, duration_minutes
FROM public.appointments
WHERE status NOT IN ('cancelled');

-- Re-grant access to the view
GRANT SELECT ON public.appointment_availability TO anon, authenticated;