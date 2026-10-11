-- Fix CRITICAL security vulnerability: Restrict freshdesk_config access to admins only
-- Currently the table has a policy that allows any user to SELECT, exposing API keys

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view freshdesk config" ON public.freshdesk_config;

-- Create a restrictive policy that only allows admins to view the config
CREATE POLICY "Only admins can view freshdesk config"
  ON public.freshdesk_config
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));