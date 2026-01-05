-- Create enums for status tracking
CREATE TYPE public.client_status AS ENUM ('lead', 'prospect', 'active', 'completed', 'churned');
CREATE TYPE public.service_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Support packages table
CREATE TABLE public.support_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hours_included INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages" ON public.support_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.support_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Clients table (core CRM)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status public.client_status NOT NULL DEFAULT 'lead',
  lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessment_responses(id) ON DELETE SET NULL,
  initial_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  support_package_id UUID REFERENCES public.support_packages(id) ON DELETE SET NULL,
  start_month DATE,
  total_contract_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage clients" ON public.clients
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Client services junction table
CREATE TABLE public.client_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  agreed_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status public.service_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client services" ON public.client_services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Monthly capacity table
CREATE TABLE public.monthly_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL UNIQUE,
  max_clients INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_capacity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view capacity" ON public.monthly_capacity
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage capacity" ON public.monthly_capacity
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_monthly_capacity_updated_at
  BEFORE UPDATE ON public.monthly_capacity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add default capacity setting to admin_settings
ALTER TABLE public.admin_settings 
  ADD COLUMN IF NOT EXISTS default_monthly_capacity INTEGER NOT NULL DEFAULT 5;