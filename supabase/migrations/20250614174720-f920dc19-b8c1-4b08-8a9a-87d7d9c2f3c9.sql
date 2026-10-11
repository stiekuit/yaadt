
-- Add name column to freshdesk_config table
ALTER TABLE public.freshdesk_config 
ADD COLUMN name text NOT NULL DEFAULT 'Default Config';

-- Update any existing records to have a meaningful name
UPDATE public.freshdesk_config 
SET name = 'Config ' || substring(id::text, 1, 8)
WHERE name = 'Default Config';
