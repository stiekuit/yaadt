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

-- Add a check constraint to prevent multiple branding records
ALTER TABLE site_branding 
ADD CONSTRAINT single_branding_record 
CHECK ((SELECT COUNT(*) FROM site_branding) <= 1);

-- Ensure we have exactly one record
INSERT INTO site_branding (site_name, logo_url) 
SELECT 'Support Portal', NULL
WHERE NOT EXISTS (SELECT 1 FROM site_branding);