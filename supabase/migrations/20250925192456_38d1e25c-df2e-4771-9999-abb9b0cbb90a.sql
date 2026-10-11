-- Fix critical security issues: Enable RLS on tables that need it

-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merged_transactions ENABLE ROW LEVEL SECURITY;

-- Add basic policies for tables that have RLS enabled but no policies
-- For data table - restrict to authenticated users only
CREATE POLICY "Authenticated users can view data" ON public.data
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage data" ON public.data
FOR ALL USING (auth.role() = 'authenticated');

-- For merged_transactions - restrict to authenticated users only
CREATE POLICY "Authenticated users can view transactions" ON public.merged_transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage transactions" ON public.merged_transactions
FOR ALL USING (auth.role() = 'service_role');