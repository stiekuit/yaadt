-- Add user ownership to chat sessions
ALTER TABLE public.chat_sessions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing chat sessions to have user_id (set to first admin for now)
UPDATE public.chat_sessions 
SET user_id = (
  SELECT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'admin' 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.chat_sessions 
ALTER COLUMN user_id SET NOT NULL;

-- Add created_by to chat messages (optional since we can use session ownership)
ALTER TABLE public.chat_messages 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing messages to have created_by based on session ownership
UPDATE public.chat_messages 
SET created_by = (
  SELECT cs.user_id 
  FROM public.chat_sessions cs 
  WHERE cs.id = chat_messages.session_id
);

-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Authenticated users can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete chat sessions" ON public.chat_sessions;

DROP POLICY IF EXISTS "Authenticated users can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can delete chat messages" ON public.chat_messages;

-- Create user-specific RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
FOR DELETE USING (auth.uid() = user_id);

-- Admin can see all chat sessions
CREATE POLICY "Admins can view all chat sessions" ON public.chat_sessions
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all chat sessions" ON public.chat_sessions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create user-specific RLS policies for chat_messages
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their sessions" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their sessions" ON public.chat_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their sessions" ON public.chat_messages
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
  )
);

-- Admin can see all messages
CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all chat messages" ON public.chat_messages
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add feature-based permissions to permissions table
INSERT INTO public.permissions (name, description, category) VALUES
('support_chat_access', 'Access to support chat functionality', 'features'),
('general_chat_access', 'Access to general chat functionality', 'features'),
('tickets_access', 'Access to tickets management', 'features'),
('settings_access', 'Access to settings and administration', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Grant all feature permissions to existing admins
INSERT INTO public.user_permissions (user_id, permission_name, granted)
SELECT ur.user_id, p.name, true
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'admin'
AND p.category IN ('features', 'admin')
ON CONFLICT (user_id, permission_name) DO UPDATE SET granted = true;

-- Grant basic feature permissions to regular users
INSERT INTO public.user_permissions (user_id, permission_name, granted)
SELECT ur.user_id, p.name, true
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'user'
AND p.name IN ('support_chat_access', 'general_chat_access', 'tickets_access')
ON CONFLICT (user_id, permission_name) DO UPDATE SET granted = true;