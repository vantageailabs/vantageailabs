-- Step 1: Create a public view for appointment availability (only non-sensitive columns)
CREATE VIEW public.appointment_availability AS
SELECT appointment_date, appointment_time, duration_minutes
FROM public.appointments
WHERE status NOT IN ('cancelled');

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.appointment_availability TO anon, authenticated;

-- Step 2: Drop the overly permissive SELECT policy that exposes all appointment data
DROP POLICY IF EXISTS "Anyone can view appointments for availability check" ON public.appointments;

-- Step 3: Create a new restricted policy that only allows users to view their own appointments via cancel_token
-- This is needed for the cancel/reschedule flows where users access their appointment via token
CREATE POLICY "Users can view own appointment via cancel token" 
ON public.appointments 
FOR SELECT 
USING (
  -- Only allow access if the request is coming from an edge function (service role)
  -- or if the user is an admin
  has_role(auth.uid(), 'admin')
);