-- Add allow_guest_access column to webhook_config
ALTER TABLE public.webhook_config 
ADD COLUMN allow_guest_access BOOLEAN NOT NULL DEFAULT false;

-- Add RLS policy to allow guests to view public webhooks
CREATE POLICY "Guests can view public webhooks"
ON public.webhook_config
FOR SELECT
TO anon
USING (allow_guest_access = true AND is_active = true);

-- Add comment for documentation
COMMENT ON COLUMN public.webhook_config.allow_guest_access IS 'When true, this webhook is accessible to unauthenticated guest users';