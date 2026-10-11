// Access request email (KAN-322). Called from the public "request access" form, so it stays reachable without a
// login (verify_jwt = false), but it can no longer be used to spam or phish the admins:
// - Only sends for a matching access_requests row created in the last 15 minutes (the form inserts it first).
// - Rate limits: 3 requests per email address per hour, 30 in total per hour.
// - Lengths and email format are checked; every value is HTML-escaped in the email, and the subject has no
//   line breaks.
// - CORS only for ALLOWED_ORIGINS (_shared/cors.ts). The request body (names, emails) is not logged.
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { corsHeaders, json } from '../_shared/cors.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PER_EMAIL_PER_HOUR = 3;
const TOTAL_PER_HOUR = 30;
const MATCH_WINDOW_MIN = 15;
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,24}$/i;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, ' ').trim();
// ilike pattern that matches this exact address (escapes the % and _ wildcards).
const exact = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max + 1) : '');

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { success: false, error: 'Method not allowed' });

  let payload: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 10_000) return json(req, 413, { success: false, error: 'Request too large' });
    payload = JSON.parse(raw);
  } catch {
    return json(req, 400, { success: false, error: 'Invalid JSON' });
  }

  const name = str(payload.requester_name, 100);
  const email = str(payload.requester_email, 255).toLowerCase();
  const organization = str(payload.requester_organization, 200);
  const message = str(payload.request_message, 2000);
  if (!name || name.length > 100) return json(req, 400, { success: false, error: 'Name is required (max 100 characters)' });
  if (!EMAIL.test(email)) return json(req, 400, { success: false, error: 'A valid email is required' });
  if (organization.length > 200) return json(req, 400, { success: false, error: 'Organization is too long' });
  if (!message || message.length > 2000) return json(req, 400, { success: false, error: 'Message is required (max 2000 characters)' });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const windowStart = new Date(Date.now() - MATCH_WINDOW_MIN * 60_000).toISOString();

  // Rate limits, counted from the stored requests.
  const [{ count: perEmail }, { count: total }] = await Promise.all([
    supabase.from('access_requests').select('id', { count: 'exact', head: true }).ilike('requester_email', exact(email)).gte('created_at', hourAgo),
    supabase.from('access_requests').select('id', { count: 'exact', head: true }).gte('created_at', hourAgo),
  ]);
  if ((perEmail ?? 0) > PER_EMAIL_PER_HOUR || (total ?? 0) > TOTAL_PER_HOUR) {
    return json(req, 429, { success: false, error: 'Too many requests. Please try again later.' });
  }

  // Only email about a request the form actually stored.
  const { data: match } = await supabase
    .from('access_requests')
    .select('id')
    .ilike('requester_email', exact(email))
    .eq('status', 'pending')
    .gte('created_at', windowStart)
    .limit(1);
  if (!match || match.length === 0) return json(req, 400, { success: false, error: 'No matching access request' });

  const { data: adminProfiles, error: adminError } = await supabase
    .from('user_roles')
    .select('user_id, profiles!inner(email, full_name)')
    .eq('role', 'admin');
  if (adminError) {
    console.error('send-access-request: could not load admins');
    return json(req, 500, { success: false, error: 'Could not send the request' });
  }
  // deno-lint-ignore no-explicit-any
  const adminEmails = (adminProfiles ?? []).map((p: any) => p.profiles?.email).filter((e: unknown) => typeof e === 'string' && e);
  if (adminEmails.length === 0) {
    console.error('send-access-request: no admin users configured');
    return json(req, 500, { success: false, error: 'Could not send the request' });
  }

  try {
    const sent = await resend.emails.send({
      from: 'Support Portal <onboarding@resend.dev>',
      to: adminEmails,
      subject: `New access request from ${oneLine(name).slice(0, 80)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Access Request</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${esc(name)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            ${organization ? `<p><strong>Organization:</strong> ${esc(organization)}</p>` : ''}
            <p><strong>Request Date:</strong> ${esc(new Date().toUTCString())}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">${esc(message)}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">To approve or deny this request, log in to the admin panel and open User Management &gt; Access Requests.</p>
          </div>
        </div>`,
    });
    console.log(`send-access-request: emailed ${adminEmails.length} admin(s)`);
    return json(req, 200, { success: true, message: 'Access request sent to administrators', emailId: sent?.data?.id ?? sent?.id ?? null });
  } catch (e) {
    console.error('send-access-request: email failed', e instanceof Error ? e.message : 'unknown');
    return json(req, 502, { success: false, error: 'Could not send the request' });
  }
});
