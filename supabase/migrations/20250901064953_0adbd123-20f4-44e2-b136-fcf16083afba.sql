-- Update profile logos with generated/uploaded images
UPDATE portal_profiles 
SET logo_url = '/src/assets/yaadt-logo.png'
WHERE name = 'yaadt';

UPDATE portal_profiles 
SET logo_url = '/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png'
WHERE name = 'payment24';

-- Radisson Red logo will be updated once uploaded
-- UPDATE portal_profiles 
-- SET logo_url = '/src/assets/radisson-red-logo.png'
-- WHERE name = 'radisson_red';