-- Phase 1: Enhance site_branding table for full-cover logo options
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS logo_opacity integer DEFAULT 100 CHECK (logo_opacity >= 0 AND logo_opacity <= 100);
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS logo_background_blur boolean DEFAULT false;
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS logo_overlay_color text DEFAULT '#000000';
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS logo_fit_style text DEFAULT 'contain' CHECK (logo_fit_style IN ('cover', 'contain', 'fill', 'tile'));
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS logo_position text DEFAULT 'center' CHECK (logo_position IN ('center', 'top', 'bottom', 'left', 'right'));

-- Mobile-specific branding
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS mobile_logo_url text;
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS mobile_logo_size text DEFAULT 'small' CHECK (mobile_logo_size IN ('small', 'medium', 'large', 'custom'));
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS mobile_layout_style text DEFAULT 'bottom-nav' CHECK (mobile_layout_style IN ('bottom-nav', 'tab-bar', 'hamburger'));
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS show_mobile_logo_in_nav boolean DEFAULT true;

-- Phase 2: Create app_branding table for logged-in interface
CREATE TABLE IF NOT EXISTS app_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Support Portal',
  logo_url text,
  logo_placement text DEFAULT 'top-left' CHECK (logo_placement IN ('top-left', 'top-center', 'top-right')),
  logo_size text DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large', 'custom')),
  logo_custom_width integer,
  logo_custom_height integer,
  show_site_name boolean DEFAULT true,
  primary_color text DEFAULT '#3b82f6',
  sidebar_bg_color text DEFAULT '#ffffff',
  header_bg_color text DEFAULT '#f9fafb',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on app_branding
ALTER TABLE app_branding ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_branding
CREATE POLICY "Everyone can view app branding"
  ON app_branding FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app branding"
  ON app_branding FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Ensure single app_branding record
CREATE OR REPLACE FUNCTION prevent_multiple_app_branding_records()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM app_branding) > 0 AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Only one app_branding record is allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER prevent_multiple_app_branding
  BEFORE INSERT ON app_branding
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_app_branding_records();

-- Create default app branding record
INSERT INTO app_branding (site_name, logo_url, logo_placement, logo_size, show_site_name, primary_color)
VALUES ('Support Portal', '/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png', 'top-left', 'medium', true, '#3b82f6')
ON CONFLICT DO NOTHING;

-- Phase 3: Add mobile_mode_preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile_mode_preference text DEFAULT 'auto' CHECK (mobile_mode_preference IN ('auto', 'mobile', 'desktop'));

-- Phase 4: Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email text NOT NULL,
  requester_name text NOT NULL,
  requester_organization text,
  request_message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  deny_reason text,
  UNIQUE(requester_email, status, created_at)
);

-- Enable RLS on access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for access_requests
CREATE POLICY "Admins can view all access requests"
  ON access_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage access requests"
  ON access_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Anyone can create access requests"
  ON access_requests FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger for app_branding
CREATE TRIGGER update_app_branding_updated_at
  BEFORE UPDATE ON app_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();