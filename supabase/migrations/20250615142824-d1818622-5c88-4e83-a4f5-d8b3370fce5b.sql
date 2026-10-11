
-- Add a unique constraint to the url column for webhook_config
ALTER TABLE webhook_config
ADD CONSTRAINT webhook_config_url_unique UNIQUE (url);
