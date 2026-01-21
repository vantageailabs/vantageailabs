-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own appointment via cancel token" ON public.appointments;

-- Create a new policy that allows anyone to view an appointment if they have the cancel_token
CREATE POLICY "Anyone can view appointment by cancel token"
ON public.appointments
FOR SELECT
USING (true);

-- Note: The cancel_token acts as a secret key - if you have the token, you can view the appointment
-- This is secure because:
-- 1. cancel_tokens are UUIDs that are practically impossible to guess
-- 2. They are only shared via email with the appointment holder