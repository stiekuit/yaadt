-- Phase 1: Critical - Restrict Webhook Config Access
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view webhook config" ON public.webhook_config;

-- Create new restricted policy for authenticated users
CREATE POLICY "Authenticated users can view webhook config"
ON public.webhook_config
FOR SELECT
TO authenticated
USING (true);

-- Phase 1: Critical - Restrict Configuration Table Policies
-- Update site_branding policy
DROP POLICY IF EXISTS "Everyone can view site branding" ON public.site_branding;
CREATE POLICY "Authenticated users can view site branding"
ON public.site_branding
FOR SELECT
TO authenticated
USING (true);

-- Update customer_field_config policy
DROP POLICY IF EXISTS "Users can view customer field config" ON public.customer_field_config;
CREATE POLICY "Authenticated users can view customer field config"
ON public.customer_field_config
FOR SELECT
TO authenticated
USING (true);

-- Update permissions policy
DROP POLICY IF EXISTS "Users can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

-- Update app_branding policy
DROP POLICY IF EXISTS "Everyone can view app branding" ON public.app_branding;
CREATE POLICY "Authenticated users can view app branding"
ON public.app_branding
FOR SELECT
TO authenticated
USING (true);

-- Update general_settings policy
DROP POLICY IF EXISTS "Users can view general settings" ON public.general_settings;
CREATE POLICY "Authenticated users can view general settings"
ON public.general_settings
FOR SELECT
TO authenticated
USING (true);

-- Phase 3: Medium - Fix Database Functions (Add SET search_path)
-- Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.user_id = _user_id
      AND up.permission_name = _permission_name
      AND up.granted = true
  )
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix create_test_plan_endpoint function
CREATE OR REPLACE FUNCTION public.create_test_plan_endpoint()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  endpoint_slug TEXT;
  api_url TEXT;
BEGIN
  -- Generate unique endpoint slug
  endpoint_slug := generate_endpoint_slug(NEW.name, NEW.plan_type);
  
  -- Construct API URL
  api_url := 'https://bycyvcmkrakyjcxplvjd.supabase.co/functions/v1/test-plan-runner/' || 
             (SELECT slug FROM tenants WHERE id = NEW.tenant_id) || '/' || endpoint_slug;
  
  -- Update test plan with endpoint info
  UPDATE public.test_plans 
  SET api_endpoint_slug = endpoint_slug,
      endpoint_generated_at = now()
  WHERE id = NEW.id;
  
  -- Create endpoint record
  INSERT INTO public.test_plan_endpoints (
    test_plan_id,
    endpoint_slug,
    api_url,
    tenant_id
  ) VALUES (
    NEW.id,
    endpoint_slug,
    api_url,
    NEW.tenant_id
  );
  
  RETURN NEW;
END;
$function$;

-- Fix generate_endpoint_slug function
CREATE OR REPLACE FUNCTION public.generate_endpoint_slug(plan_name text, plan_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  sanitized_name TEXT;
  short_uuid TEXT;
  slug TEXT;
BEGIN
  -- Sanitize name: lowercase, replace spaces and special chars with hyphens
  sanitized_name := lower(regexp_replace(plan_name, '[^a-zA-Z0-9]+', '-', 'g'));
  sanitized_name := trim(both '-' from sanitized_name);
  
  -- Generate short UUID (first 8 characters)
  short_uuid := substring(gen_random_uuid()::text from 1 for 8);
  
  -- Create slug: {plan-type}-{sanitized-name}-{short-uuid}
  slug := plan_type || '-' || sanitized_name || '-' || short_uuid;
  
  RETURN slug;
END;
$function$;