-- The view with SECURITY INVOKER won't work because the underlying table
-- no longer has a public SELECT policy. We need to use SECURITY DEFINER
-- to allow public access to just the availability data.
-- This is safe because we only expose non-sensitive columns.

DROP VIEW IF EXISTS public.appointment_availability;

-- Create the view with SECURITY DEFINER (default) to bypass RLS on appointments
-- This is intentionally using SECURITY DEFINER because we want public access
-- to ONLY the availability data (date, time, duration) - no sensitive data
CREATE VIEW public.appointment_availability AS
SELECT appointment_date, appointment_time, duration_minutes
FROM public.appointments
WHERE status NOT IN ('cancelled');

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.appointment_availability TO anon, authenticated;

-- Add comment explaining why SECURITY DEFINER is intentional
COMMENT ON VIEW public.appointment_availability IS 
'Public view for checking appointment availability. Uses SECURITY DEFINER intentionally to expose only non-sensitive scheduling data (date, time, duration) while the appointments table with sensitive customer data remains protected.';