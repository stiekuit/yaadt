-- Fix critical security issues and create default branding record

-- First, let's add proper RLS policies for freshdesk_config
DROP POLICY IF EXISTS "Anyone can view freshdesk config" ON freshdesk_config;
DROP POLICY IF EXISTS "Anyone can insert freshdesk config" ON freshdesk_config;
DROP POLICY IF EXISTS "Anyone can update freshdesk config" ON freshdesk_config;
DROP POLICY IF EXISTS "Anyone can delete freshdesk config" ON freshdesk_config;

CREATE POLICY "Admins can manage freshdesk config" 
ON freshdesk_config FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view freshdesk config" 
ON freshdesk_config FOR SELECT 
USING (true);

-- Fix webhook_config policies 
DROP POLICY IF EXISTS "Anyone can view webhook config" ON webhook_config;
DROP POLICY IF EXISTS "Anyone can insert webhook config" ON webhook_config;
DROP POLICY IF EXISTS "Anyone can update webhook config" ON webhook_config;
DROP POLICY IF EXISTS "Anyone can delete webhook config" ON webhook_config;

CREATE POLICY "Admins can manage webhook config" 
ON webhook_config FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view webhook config" 
ON webhook_config FOR SELECT 
USING (true);

-- Fix freshdesk_category_config policies
DROP POLICY IF EXISTS "Anyone can view freshdesk category config" ON freshdesk_category_config;
DROP POLICY IF EXISTS "Anyone can insert freshdesk category config" ON freshdesk_category_config;
DROP POLICY IF EXISTS "Anyone can update freshdesk category config" ON freshdesk_category_config;
DROP POLICY IF EXISTS "Anyone can delete freshdesk category config" ON freshdesk_category_config;

CREATE POLICY "Admins can manage freshdesk category config" 
ON freshdesk_category_config FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view freshdesk category config" 
ON freshdesk_category_config FOR SELECT 
USING (true);

-- Fix general_settings policies
DROP POLICY IF EXISTS "Anyone can view general settings" ON general_settings;
DROP POLICY IF EXISTS "Anyone can insert general settings" ON general_settings;
DROP POLICY IF EXISTS "Anyone can update general settings" ON general_settings;
DROP POLICY IF EXISTS "Anyone can delete general settings" ON general_settings;

CREATE POLICY "Admins can manage general settings" 
ON general_settings FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view general settings" 
ON general_settings FOR SELECT 
USING (true);

-- Secure merged_transactions table - this contains financial data!
ALTER TABLE merged_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view transactions" ON merged_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON merged_transactions;

CREATE POLICY "Admins can view transactions" 
ON merged_transactions FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Service role can manage transactions" 
ON merged_transactions FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create default branding record if none exists
INSERT INTO site_branding (
  site_name,
  logo_url,
  logo_placement,
  logo_size,
  landing_page_style,
  show_site_name_on_landing,
  yaadt_footer_enabled,
  landing_background_color
) 
SELECT 
  'Support Portal',
  '/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png',
  'top-center',
  'medium',
  'minimal',
  true,
  true,
  '#f9fafb'
WHERE NOT EXISTS (SELECT 1 FROM site_branding);

-- Create function to ensure default branding exists
CREATE OR REPLACE FUNCTION public.ensure_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create default branding record if none exists
  IF NOT EXISTS (SELECT 1 FROM site_branding) THEN
    INSERT INTO site_branding (
      site_name,
      logo_url,
      logo_placement,
      logo_size,
      landing_page_style,
      show_site_name_on_landing,
      yaadt_footer_enabled,
      landing_background_color
    ) VALUES (
      'Support Portal',
      '/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png',
      'top-center',
      'medium',
      'minimal',
      true,
      true,
      '#f9fafb'
    );
  END IF;
  
  RETURN NEW;
END;
$$;