-- Add Zoom meeting columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN zoom_meeting_id TEXT,
ADD COLUMN zoom_join_url TEXT,
ADD COLUMN zoom_start_url TEXT,
ADD COLUMN zoom_password TEXT;