-- Create feature_requests table for incoming feature requests from client websites
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
  source_identifier TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  quoted_amount NUMERIC,
  notes TEXT,
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feature requests (public form)
CREATE POLICY "Anyone can submit feature requests"
ON public.feature_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view feature requests
CREATE POLICY "Admins can manage feature requests"
ON public.feature_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();