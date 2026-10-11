// Freshdesk proxy (KAN-322). Calls the Freshdesk API with the stored key on behalf of a signed-in YAADT user.
//
// Before: no login check (verify_jwt = false), CORS '*', and any caller-supplied endpoint and method (including
// DELETE) was forwarded with the Freshdesk admin key.
//
// Now:
// - verify_jwt = true (supabase/config.toml), and the user is checked again here with supabase.auth.getUser().
// - Only the operations in ops.ts are allowed, each needing a permission from user_permissions (admins are always
//   allowed). Anything else gets 400; there is no DELETE.
// - Ticket ids must be positive integers; request bodies are size-limited and only sent where expected.
// - CORS only for ALLOWED_ORIGINS (_shared/cors.ts).
// - The Freshdesk key never leaves the server and is never logged. Freshdesk error bodies are not passed back.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { resolve } from './ops.ts';

const MAX_BODY_BYTES = 64 * 1024;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1. Who is calling? (verify_jwt already rejects missing or invalid tokens; this also gets the user id.)
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json(req, 401, { error: 'Sign in required' });
  const asUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await asUser.auth.getUser();
  if (userError || !userData?.user) return json(req, 401, { error: 'Sign in required' });
  const userId = userData.user.id;

  // 2. Which operation? Only the allowlisted ones.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(req, 413, { error: 'Request too large' });
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    return json(req, 400, { error: 'Invalid JSON' });
  }
  const resolved = input && typeof input === 'object' ? resolve(input) : null;
  if (!resolved) return json(req, 400, { error: 'Operation not allowed' });
  if (resolved.op.hasBody && (typeof resolved.body !== 'object' || resolved.body === null || Array.isArray(resolved.body))) {
    return json(req, 400, { error: 'A JSON object body is required' });
  }

  // 3. Is the user allowed to do it? Admins always; others need one of the operation's permissions.
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin, error: roleError } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (roleError) return json(req, 500, { error: 'Permission check failed' });
  if (!isAdmin) {
    const { data: perms, error: permError } = await admin
      .from('user_permissions')
      .select('permission_name')
      .eq('user_id', userId)
      .eq('granted', true)
      .in('permission_name', resolved.op.permissions);
    if (permError) return json(req, 500, { error: 'Permission check failed' });
    if (!perms || perms.length === 0) return json(req, 403, { error: 'Not allowed' });
  }

  // 4. Call Freshdesk with the stored key (server-side only).
  const { data: config, error: configError } = await admin
    .from('freshdesk_config')
    .select('domain, api_key')
    .eq('is_active', true)
    .single();
  if (configError || !config) return json(req, 500, { error: 'No active Freshdesk configuration' });
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/i.test(String(config.domain))) return json(req, 500, { error: 'Invalid Freshdesk domain in configuration' });

  const url = `https://${config.domain}.freshdesk.com/api/v2${resolved.op.path(resolved.ticketId)}`;
  const init: RequestInit = {
    method: resolved.op.method,
    headers: { Authorization: `Basic ${btoa(`${config.api_key}:X`)}`, 'Content-Type': 'application/json' },
  };
  if (resolved.op.hasBody) init.body = JSON.stringify(resolved.body);

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.error(`freshdesk-proxy ${resolved.name}: Freshdesk returned ${res.status}`);
      return json(req, res.status >= 500 ? 502 : res.status, { error: `Freshdesk error ${res.status}`, status: res.status });
    }
    return json(req, 200, await res.json());
  } catch (e) {
    console.error(`freshdesk-proxy ${resolved.name}: request failed`, e instanceof Error ? e.message : 'unknown');
    return json(req, 502, { error: 'Freshdesk request failed' });
  }
});
