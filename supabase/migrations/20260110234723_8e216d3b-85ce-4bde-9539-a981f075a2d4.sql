-- Add columns to track which reminder emails have been sent
ALTER TABLE appointments 
ADD COLUMN reminder_24h_sent BOOLEAN DEFAULT false,
ADD COLUMN reminder_1h_sent BOOLEAN DEFAULT false;

-- Create index for efficient reminder queries
CREATE INDEX idx_appointments_reminders ON appointments(appointment_date, appointment_time, status) 
WHERE status != 'cancelled';