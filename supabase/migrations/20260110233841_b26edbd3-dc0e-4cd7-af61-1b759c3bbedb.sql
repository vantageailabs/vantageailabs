-- Add cancel_token column to appointments table for secure cancel/reschedule links
ALTER TABLE appointments 
ADD COLUMN cancel_token UUID DEFAULT gen_random_uuid();

-- Create index for faster lookups by cancel_token
CREATE INDEX idx_appointments_cancel_token ON appointments(cancel_token);