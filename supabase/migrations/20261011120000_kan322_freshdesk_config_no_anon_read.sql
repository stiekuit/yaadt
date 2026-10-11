-- KAN-322: the Freshdesk API key in freshdesk_config was readable by anyone.
-- The policy "Users can view freshdesk config" was FOR SELECT USING (true) with no role, so the anon role (the
-- publishable key that ships in the website) could read every column, including api_key, over the REST API.
-- Step 1 (this migration): only signed-in users can read the table; admins keep full access.
-- Step 2 (follow-up, needs a frontend release): make api_key unreadable from the browser altogether (column
-- privileges) once the app stops selecting it. See KAN-322.

DROP POLICY IF EXISTS "Users can view freshdesk config" ON public.freshdesk_config;

CREATE POLICY "Signed-in users can view freshdesk config"
ON public.freshdesk_config FOR SELECT
TO authenticated
USING (true);

-- Make sure RLS is on (it should already be).
ALTER TABLE public.freshdesk_config ENABLE ROW LEVEL SECURITY;
