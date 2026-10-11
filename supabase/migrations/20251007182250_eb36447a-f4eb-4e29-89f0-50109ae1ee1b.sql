-- Create auth_audit_logs table for authentication monitoring
CREATE TABLE public.auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'signup', 'failed_login', 'password_reset', 'email_change')),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access to auth logs
CREATE POLICY "Admins can view all auth logs"
ON public.auth_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Service role can insert auth logs
CREATE POLICY "Service role can insert auth logs"
ON public.auth_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_auth_audit_logs_user_id ON public.auth_audit_logs(user_id);
CREATE INDEX idx_auth_audit_logs_event_type ON public.auth_audit_logs(event_type);
CREATE INDEX idx_auth_audit_logs_created_at ON public.auth_audit_logs(created_at DESC);
CREATE INDEX idx_auth_audit_logs_email ON public.auth_audit_logs(email);

-- Add monitoring mode preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monitoring_mode_preference TEXT DEFAULT 'default' CHECK (monitoring_mode_preference IN ('default', 'debug')),
ADD COLUMN IF NOT EXISTS can_use_debug_mode BOOLEAN DEFAULT false;

-- Create admin_queries table for query history
CREATE TABLE public.admin_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query_name TEXT NOT NULL,
  query_sql TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_queries ENABLE ROW LEVEL SECURITY;

-- Admins can manage their queries
CREATE POLICY "Admins can manage their own queries"
ON public.admin_queries
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role) AND user_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin'::user_role) AND user_id = auth.uid());

-- Create index
CREATE INDEX idx_admin_queries_user_id ON public.admin_queries(user_id);

-- Grant debug mode access to first admin
UPDATE public.profiles
SET can_use_debug_mode = true
WHERE id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'::user_role 
  LIMIT 1
);