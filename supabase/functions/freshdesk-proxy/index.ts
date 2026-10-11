
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FreshdeskProxyRequest {
  endpoint: string;
  method?: string;
  body?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET', body }: FreshdeskProxyRequest = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: endpoint' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active Freshdesk config from database (server-side, secure)
    const { data: config, error: configError } = await supabase
      .from('freshdesk_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('Error fetching Freshdesk config:', configError);
      return new Response(
        JSON.stringify({ error: 'No active Freshdesk configuration found' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Making Freshdesk API call: ${method} ${endpoint}`);

    const freshdeskUrl = `https://${config.domain}.freshdesk.com/api/v2${endpoint}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${btoa(`${config.api_key}:X`)}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(freshdeskUrl, requestOptions);

    if (!response.ok) {
      console.error(`Freshdesk API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          error: `Freshdesk API error: ${response.status} ${response.statusText}`,
          details: errorText,
          status: response.status 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in freshdesk-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
