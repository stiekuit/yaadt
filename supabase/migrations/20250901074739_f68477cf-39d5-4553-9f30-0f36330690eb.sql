-- Update Radisson Red logo URL
UPDATE portal_profiles 
SET logo_url = '/src/assets/radisson-red-logo.png'
WHERE name = 'radisson_red';

-- Grant default access to all profiles for the first admin user
INSERT INTO user_profile_access (user_id, profile_id, is_default)
SELECT 
  p.id as user_id,
  pp.id as profile_id,
  CASE WHEN pp.name = 'payment24' THEN true ELSE false END as is_default
FROM profiles p
CROSS JOIN portal_profiles pp
WHERE p.id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'::user_role
)
ON CONFLICT (user_id, profile_id) DO NOTHING;