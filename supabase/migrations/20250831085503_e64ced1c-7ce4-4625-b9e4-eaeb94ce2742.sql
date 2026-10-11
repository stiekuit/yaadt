-- Create portal profiles table
CREATE TABLE portal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  portal_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profile access table
CREATE TABLE user_profile_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES portal_profiles(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID,
  UNIQUE(user_id, profile_id)
);

-- Create profile-specific customer fields table
CREATE TABLE profile_customer_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES portal_profiles(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  placeholder_text VARCHAR(200),
  icon VARCHAR(50) DEFAULT 'Type',
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, field_name)
);

-- Insert default profiles
INSERT INTO portal_profiles (name, display_name, description, portal_type, primary_color, secondary_color, display_order) VALUES
('yaadt', 'Yaadt.com', 'Personal Tech Support & Development Services', 'personal', '#6366F1', '#8B5CF6', 1),
('payment24', 'Payment24', 'IT Support Queries & Helpdesk', 'it_support', '#0EA5E9', '#06B6D4', 2),
('radisson_red', 'Radisson Red', 'Hotel Room Service & Guest Support', 'hospitality', '#DC2626', '#EF4444', 3);

-- Insert default customer fields for each profile
INSERT INTO profile_customer_fields (profile_id, field_name, display_name, placeholder_text, icon, display_order) VALUES
-- Yaadt.com fields
((SELECT id FROM portal_profiles WHERE name = 'yaadt'), 'project_id', 'Project ID', 'Enter project identifier', 'Folder', 1),
((SELECT id FROM portal_profiles WHERE name = 'yaadt'), 'client_reference', 'Client Reference', 'Enter client reference number', 'User', 2),
((SELECT id FROM portal_profiles WHERE name = 'yaadt'), 'service_type', 'Service Type', 'Development, Support, Consulting', 'Settings', 3),

-- Payment24 fields
((SELECT id FROM portal_profiles WHERE name = 'payment24'), 'device_serial', 'Device Serial Number', 'Enter device serial number', 'Smartphone', 1),
((SELECT id FROM portal_profiles WHERE name = 'payment24'), 'asset_tag', 'Asset Tag', 'Enter asset tag number', 'Tag', 2),
((SELECT id FROM portal_profiles WHERE name = 'payment24'), 'employee_id', 'Employee ID', 'Enter employee ID', 'IdCard', 3),

-- Radisson Red fields
((SELECT id FROM portal_profiles WHERE name = 'radisson_red'), 'room_number', 'Room Number', 'Enter room number', 'MapPin', 1),
((SELECT id FROM portal_profiles WHERE name = 'radisson_red'), 'guest_name', 'Guest Name', 'Enter guest name', 'User', 2),
((SELECT id FROM portal_profiles WHERE name = 'radisson_red'), 'service_type', 'Service Type', 'Housekeeping, Maintenance, Concierge', 'Bell', 3);

-- Enable RLS
ALTER TABLE portal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_customer_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portal_profiles
CREATE POLICY "Anyone can view portal profiles" ON portal_profiles FOR SELECT USING (true);
CREATE POLICY "Admins can manage portal profiles" ON portal_profiles FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for user_profile_access
CREATE POLICY "Users can view their profile access" ON user_profile_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage profile access" ON user_profile_access FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for profile_customer_fields
CREATE POLICY "Users can view customer fields for their profiles" ON profile_customer_fields FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profile_access upa 
    WHERE upa.user_id = auth.uid() 
    AND upa.profile_id = profile_customer_fields.profile_id
  )
);
CREATE POLICY "Admins can manage customer fields" ON profile_customer_fields FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_portal_profiles_updated_at
BEFORE UPDATE ON portal_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_customer_fields_updated_at
BEFORE UPDATE ON profile_customer_fields
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();