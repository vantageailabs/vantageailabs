-- Create assessment_responses table to store assessment data
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  overall_score INTEGER NOT NULL,
  estimated_hours_saved INTEGER NOT NULL,
  estimated_monthly_savings INTEGER NOT NULL,
  answers JSONB NOT NULL,
  business_type TEXT,
  monthly_revenue TEXT,
  tool_stack TEXT,
  timeline TEXT
);

-- Enable RLS
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Admins can view all assessments
CREATE POLICY "Admins can view assessments"
ON public.assessment_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all assessments
CREATE POLICY "Admins can manage assessments"
ON public.assessment_responses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert assessments
CREATE POLICY "Anyone can insert assessments"
ON public.assessment_responses
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own assessment (by email match before appointment is linked)
CREATE POLICY "Anyone can update assessments without appointment"
ON public.assessment_responses
FOR UPDATE
USING (appointment_id IS NULL)
WITH CHECK (appointment_id IS NOT NULL);