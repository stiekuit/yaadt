-- Extend site_branding table with advanced logo and landing page options
ALTER TABLE public.site_branding 
ADD COLUMN logo_placement TEXT DEFAULT 'top-center' CHECK (logo_placement IN ('top-center', 'top-left', 'full-page', 'background', 'header-only')),
ADD COLUMN logo_size TEXT DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large', 'full-width', 'custom')),
ADD COLUMN logo_custom_width INTEGER DEFAULT NULL,
ADD COLUMN logo_custom_height INTEGER DEFAULT NULL,
ADD COLUMN landing_page_style TEXT DEFAULT 'minimal' CHECK (landing_page_style IN ('minimal', 'full-logo', 'centered', 'split')),
ADD COLUMN show_site_name_on_landing BOOLEAN DEFAULT TRUE,
ADD COLUMN landing_background_color TEXT DEFAULT '#f9fafb',
ADD COLUMN yaadt_footer_enabled BOOLEAN DEFAULT TRUE;