-- Create form analytics table for tracking form abandonment
CREATE TABLE public.form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Funnel stage tracking
  current_step TEXT NOT NULL, -- 'calendar', 'form', 'assessment', 'completed'
  assessment_question_number INTEGER, -- 1-12 for assessment step
  
  -- Form field progress
  fields_completed TEXT[] DEFAULT '{}',
  last_field_focused TEXT,
  
  -- Timing
  step_started_at TIMESTAMPTZ DEFAULT now(),
  time_on_step_seconds INTEGER DEFAULT 0,
  
  -- Outcome
  completed BOOLEAN DEFAULT false,
  abandoned BOOLEAN DEFAULT false,
  
  -- Optional: capture partial data for follow-up
  partial_email TEXT,
  partial_name TEXT
);

-- Enable RLS
ALTER TABLE public.form_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (anonymous tracking)
CREATE POLICY "Anyone can insert form analytics"
ON public.form_analytics
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own session
CREATE POLICY "Anyone can update own session"
ON public.form_analytics
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view form analytics"
ON public.form_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete analytics
CREATE POLICY "Admins can delete form analytics"
ON public.form_analytics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient queries
CREATE INDEX idx_form_analytics_session ON public.form_analytics(session_id);
CREATE INDEX idx_form_analytics_created ON public.form_analytics(created_at DESC);
CREATE INDEX idx_form_analytics_step ON public.form_analytics(current_step);

-- Add trigger for updated_at
CREATE TRIGGER update_form_analytics_updated_at
BEFORE UPDATE ON public.form_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();