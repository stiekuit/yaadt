-- Fix security warning for the prevent_multiple_branding_records function
CREATE OR REPLACE FUNCTION prevent_multiple_branding_records()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM site_branding) > 0 AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Only one site_branding record is allowed';
  END IF;
  RETURN NEW;
END;
$$;