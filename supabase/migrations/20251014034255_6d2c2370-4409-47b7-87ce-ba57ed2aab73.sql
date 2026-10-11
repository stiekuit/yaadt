-- Create app_permissions table for granular feature access
CREATE TABLE IF NOT EXISTS public.app_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text UNIQUE NOT NULL,
  permission_value boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read permissions (needed for guest access checks)
CREATE POLICY "Anyone can read app permissions"
  ON public.app_permissions
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can modify permissions
CREATE POLICY "Admins can update app permissions"
  ON public.app_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert default permissions
INSERT INTO public.app_permissions (permission_key, permission_value, description) VALUES
  ('guest_chat_access', true, 'Allow guests to access support chat without authentication'),
  ('guest_ticket_access', false, 'Allow guests to view and create tickets without authentication'),
  ('guest_general_chat_access', false, 'Allow guests to access general chat without authentication')
ON CONFLICT (permission_key) DO NOTHING;