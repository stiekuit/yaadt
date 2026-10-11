
-- Create permissions table to define available system permissions
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_permissions table for granular permission assignment
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name text NOT NULL REFERENCES public.permissions(name) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_name)
);

-- Add category_id to track ticket categories (if needed for integration)
ALTER TABLE public.freshdesk_config 
ADD COLUMN IF NOT EXISTS default_category_id uuid REFERENCES public.freshdesk_category_config(id);

-- Enable RLS on permissions tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permissions (admins can manage all, users can view their own)
CREATE POLICY "Admins can manage all permissions" 
  ON public.permissions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view permissions" 
  ON public.permissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage user permissions" 
  ON public.user_permissions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own permissions" 
  ON public.user_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
('chat_access', 'Access to chat functionality', 'chat'),
('chat_create', 'Create new chat sessions', 'chat'),
('chat_delete', 'Delete chat sessions', 'chat'),
('ticket_view', 'View tickets', 'tickets'),
('ticket_create', 'Create new tickets', 'tickets'),
('ticket_edit', 'Edit existing tickets', 'tickets'),
('ticket_delete', 'Delete tickets', 'tickets'),
('ticket_assign', 'Assign tickets to agents', 'tickets'),
('ticket_status_change', 'Change ticket status', 'tickets'),
('admin_access', 'Access to admin panel', 'admin'),
('user_management', 'Manage users and permissions', 'admin'),
('system_settings', 'Manage system settings', 'admin');

-- Create function to assign default permissions to new users
CREATE OR REPLACE FUNCTION public.assign_default_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get user role
  DECLARE
    user_role user_role;
  BEGIN
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = NEW.id 
    LIMIT 1;

    -- Assign permissions based on role
    IF user_role = 'admin' THEN
      -- Admins get all permissions
      INSERT INTO public.user_permissions (user_id, permission_name)
      SELECT NEW.id, name FROM public.permissions
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    ELSE
      -- Regular users get basic permissions
      INSERT INTO public.user_permissions (user_id, permission_name)
      VALUES 
        (NEW.id, 'chat_access'),
        (NEW.id, 'chat_create'),
        (NEW.id, 'ticket_view'),
        (NEW.id, 'ticket_create')
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END IF;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign default permissions when profile is created
CREATE TRIGGER assign_default_permissions_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_permissions();

-- Create helper function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.user_id = _user_id
      AND up.permission_name = _permission_name
      AND up.granted = true
  )
$$;
