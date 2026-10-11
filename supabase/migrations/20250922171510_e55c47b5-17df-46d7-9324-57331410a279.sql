-- Clean up duplicate site_branding records, keeping only the most recent one
WITH ranked_branding AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY updated_at DESC, created_at DESC) as rn
  FROM site_branding
)
DELETE FROM site_branding 
WHERE id IN (
  SELECT id FROM ranked_branding WHERE rn > 1
);

-- Create function to prevent multiple branding records
CREATE OR REPLACE FUNCTION prevent_multiple_branding_records()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM site_branding) > 0 AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Only one site_branding record is allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single record constraint
DROP TRIGGER IF EXISTS enforce_single_branding_record ON site_branding;
CREATE TRIGGER enforce_single_branding_record
  BEFORE INSERT ON site_branding
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_branding_records();

-- Ensure we have exactly one record
INSERT INTO site_branding (site_name, logo_url) 
SELECT 'Support Portal', NULL
WHERE NOT EXISTS (SELECT 1 FROM site_branding);