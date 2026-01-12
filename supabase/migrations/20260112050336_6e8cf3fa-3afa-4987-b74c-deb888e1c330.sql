-- Fix the assessment update policy to add email validation
-- This prevents users from linking someone else's assessment to their appointment

DROP POLICY IF EXISTS "Anyone can update assessments without appointment" ON public.assessment_responses;

-- Create improved policy that validates email matches
-- This ensures the assessment email matches the appointment guest email
CREATE POLICY "Anyone can update their own assessments without appointment"
ON public.assessment_responses
FOR UPDATE
USING (appointment_id IS NULL)
WITH CHECK (
  appointment_id IS NOT NULL AND
  email = (SELECT guest_email FROM appointments WHERE id = appointment_id)
);