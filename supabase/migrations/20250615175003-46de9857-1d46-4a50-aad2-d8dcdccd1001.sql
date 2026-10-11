
-- Add ticket_id column to chat_sessions table
ALTER TABLE public.chat_sessions 
ADD COLUMN ticket_id TEXT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN public.chat_sessions.ticket_id IS 'Stores the Freshdesk ticket ID when a ticket is created from this chat session';
