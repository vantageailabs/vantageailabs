-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing RLS policies to use has_role function

-- admin_settings policies
DROP POLICY IF EXISTS "Admins can manage admin settings" ON public.admin_settings;
CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- appointments policies
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
CREATE POLICY "Admins can manage all appointments"
ON public.appointments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- blocked_dates policies
DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins can manage blocked dates"
ON public.blocked_dates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- lead_submissions policies
DROP POLICY IF EXISTS "Admins can view leads" ON public.lead_submissions;
CREATE POLICY "Admins can view leads"
ON public.lead_submissions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- working_hours policies
DROP POLICY IF EXISTS "Admins can manage working hours" ON public.working_hours;
CREATE POLICY "Admins can manage working hours"
ON public.working_hours
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));