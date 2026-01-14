-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessment_responses;

-- Create a PERMISSIVE INSERT policy instead (default is PERMISSIVE)
CREATE POLICY "Anyone can insert assessments"
ON public.assessment_responses
FOR INSERT
TO public
WITH CHECK (true);

-- Also fix the UPDATE policy - drop the restrictive one and make it permissive
DROP POLICY IF EXISTS "Anyone can update their own assessments without appointment" ON public.assessment_responses;

CREATE POLICY "Anyone can update their own assessments without appointment"
ON public.assessment_responses
FOR UPDATE
TO public
USING (appointment_id IS NULL)
WITH CHECK (true);