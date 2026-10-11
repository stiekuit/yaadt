
-- Add chat_type column to webhook_config table
ALTER TABLE public.webhook_config 
ADD COLUMN chat_type TEXT DEFAULT 'support' CHECK (chat_type IN ('support', 'general'));

-- Add chat_type and webhook_id columns to chat_sessions table  
ALTER TABLE public.chat_sessions 
ADD COLUMN chat_type TEXT DEFAULT 'support' CHECK (chat_type IN ('support', 'general')),
ADD COLUMN webhook_id UUID REFERENCES public.webhook_config(id);

-- Update existing webhook configs to have support chat_type
UPDATE public.webhook_config 
SET chat_type = 'support' 
WHERE chat_type IS NULL;

-- Update existing chat sessions to have support chat_type
UPDATE public.chat_sessions 
SET chat_type = 'support' 
WHERE chat_type IS NULL;

-- Make chat_type NOT NULL after setting defaults
ALTER TABLE public.webhook_config 
ALTER COLUMN chat_type SET NOT NULL;

ALTER TABLE public.chat_sessions 
ALTER COLUMN chat_type SET NOT NULL;
