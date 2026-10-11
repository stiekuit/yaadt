
-- Add customer information fields to chat_sessions table
ALTER TABLE public.chat_sessions 
ADD COLUMN customer_name text,
ADD COLUMN customer_email text,
ADD COLUMN customer_number text;
