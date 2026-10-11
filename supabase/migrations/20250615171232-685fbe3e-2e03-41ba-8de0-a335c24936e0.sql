
-- Add device_serials column to chat_sessions table to store multiple device serial numbers
ALTER TABLE chat_sessions 
ADD COLUMN device_serials TEXT[] DEFAULT '{}';
