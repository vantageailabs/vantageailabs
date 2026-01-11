-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a cron job to call send-reminders every 15 minutes
SELECT cron.schedule(
  'send-appointment-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://cketdqusxoymxbrxbkez.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZXRkcXVzeG95bXhicnhia2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMTM2MzAsImV4cCI6MjA4MTU4OTYzMH0.pRZxa6XCTrkwUFpjzcQGmzzUIuvkfFRrUtLhnqrZIKQ"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);