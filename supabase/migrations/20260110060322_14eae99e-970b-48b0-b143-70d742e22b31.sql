-- Rename Zoom columns to generic meeting columns for Google Meet migration
ALTER TABLE public.appointments 
  RENAME COLUMN zoom_meeting_id TO meeting_id;

ALTER TABLE public.appointments 
  RENAME COLUMN zoom_join_url TO meeting_join_url;

-- Drop unused columns (zoom_start_url and zoom_password not needed for Google Meet)
ALTER TABLE public.appointments 
  DROP COLUMN zoom_start_url,
  DROP COLUMN zoom_password;