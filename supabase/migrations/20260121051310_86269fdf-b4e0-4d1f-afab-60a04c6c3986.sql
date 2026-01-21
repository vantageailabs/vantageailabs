-- Create function to auto-convert referrals when a client gets a service
CREATE OR REPLACE FUNCTION public.auto_convert_referral()
RETURNS TRIGGER AS $$
DECLARE
  client_record RECORD;
  referral_record RECORD;
BEGIN
  -- Get the client's email
  SELECT id, email INTO client_record 
  FROM public.clients 
  WHERE id = NEW.client_id;
  
  -- Find matching pending referral by email
  SELECT id INTO referral_record
  FROM public.referrals
  WHERE referred_email = client_record.email
    AND status = 'pending'
  LIMIT 1;
  
  -- If found, convert it
  IF referral_record.id IS NOT NULL THEN
    UPDATE public.referrals
    SET status = 'converted',
        converted_at = NOW(),
        referred_client_id = client_record.id
    WHERE id = referral_record.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that fires when a new client_service is created
CREATE TRIGGER trigger_auto_convert_referral
AFTER INSERT ON public.client_services
FOR EACH ROW
EXECUTE FUNCTION public.auto_convert_referral();