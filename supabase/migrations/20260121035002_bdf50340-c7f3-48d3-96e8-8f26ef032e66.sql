-- Create project_status enum
CREATE TYPE public.project_status AS ENUM ('active', 'paused', 'archived');

-- Create scope_category enum for work classification
CREATE TYPE public.scope_category AS ENUM ('maintenance', 'content_update', 'new_page', 'enhancement', 'integration', 'new_project');

-- Create client_projects table
CREATE TABLE public.client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  status project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_projects
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;

-- RLS policy for client_projects
CREATE POLICY "Admins can manage client projects"
ON public.client_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_client_projects_updated_at
BEFORE UPDATE ON public.client_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add portfolio-based columns to support_packages
ALTER TABLE public.support_packages 
ADD COLUMN max_projects INTEGER DEFAULT NULL,
ADD COLUMN tier_type TEXT NOT NULL DEFAULT 'single';

-- Add project_id and scope_category to client_services
ALTER TABLE public.client_services
ADD COLUMN project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
ADD COLUMN scope_category scope_category DEFAULT 'new_project';

-- Create index for faster queries
CREATE INDEX idx_client_projects_client_id ON public.client_projects(client_id);
CREATE INDEX idx_client_services_project_id ON public.client_services(project_id);