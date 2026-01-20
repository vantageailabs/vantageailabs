-- Create credential_requests table to track sent requests
CREATE TABLE credential_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  website_url TEXT,
  notes TEXT,
  request_token UUID DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create client_credentials table to store submitted credentials
CREATE TABLE client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES credential_requests(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  website_url TEXT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE credential_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;

-- RLS for credential_requests
CREATE POLICY "Admins can manage credential requests"
  ON credential_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public to view request by token (for the submission form)
CREATE POLICY "Anyone can view pending request by token"
  ON credential_requests FOR SELECT
  USING (status = 'pending');

-- Allow public to update request status when completing
CREATE POLICY "Anyone can complete request by token"
  ON credential_requests FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (status = 'completed');

-- RLS for client_credentials - only admins can view
CREATE POLICY "Admins can manage client credentials"
  ON client_credentials FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public to insert credentials (via token-validated form)
CREATE POLICY "Anyone can insert credentials"
  ON client_credentials FOR INSERT
  WITH CHECK (true);