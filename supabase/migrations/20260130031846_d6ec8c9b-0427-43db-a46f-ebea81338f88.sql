-- Add BOS submission reference to appointments table
ALTER TABLE public.appointments 
ADD COLUMN bos_submission_id uuid REFERENCES public.bos_builder_submissions(id);

-- Add index for efficient lookups
CREATE INDEX idx_appointments_bos_submission_id ON public.appointments(bos_submission_id);