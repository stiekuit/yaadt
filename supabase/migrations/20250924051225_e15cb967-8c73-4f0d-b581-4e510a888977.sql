-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can delete chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON public.chat_sessions;

-- Create secure RLS policies for chat_sessions
-- Only authenticated users can view chat sessions (support staff)
CREATE POLICY "Authenticated users can view chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can create chat sessions
CREATE POLICY "Authenticated users can create chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update chat sessions
CREATE POLICY "Authenticated users can update chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete chat sessions
CREATE POLICY "Authenticated users can delete chat sessions" 
ON public.chat_sessions 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Apply similar security fixes to chat_messages table
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;

-- Create secure policies for chat_messages
CREATE POLICY "Authenticated users can view chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete chat messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.role() = 'authenticated');