-- Remove multi-profile system tables
DROP TABLE IF EXISTS profile_customer_fields CASCADE;
DROP TABLE IF EXISTS user_profile_access CASCADE;
DROP TABLE IF EXISTS portal_profiles CASCADE;

-- Create customer field configuration table for single portal
CREATE TABLE public.customer_field_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL DEFAULT 'text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  placeholder_text VARCHAR(200),
  display_order INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(50) DEFAULT 'Type',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_field_config ENABLE ROW LEVEL SECURITY;

-- Create policies for customer field config
CREATE POLICY "Admins can manage customer field config" 
ON public.customer_field_config 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view customer field config" 
ON public.customer_field_config 
FOR SELECT 
USING (true);

-- Insert default customer field configuration
INSERT INTO public.customer_field_config (field_name, display_name, field_type, is_required, is_visible, placeholder_text, display_order, icon) VALUES
('customer_name', 'Customer Name', 'text', true, true, 'Enter customer full name', 1, 'User'),
('customer_email', 'Email Address', 'email', true, true, 'Enter customer email address', 2, 'Mail'),
('customer_number', 'Phone Number', 'tel', false, true, 'Enter customer phone number', 3, 'Phone'),
('device_serials', 'Device Serial Numbers', 'array', false, true, 'Add device serial numbers', 4, 'Smartphone');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_field_config_updated_at
BEFORE UPDATE ON public.customer_field_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();