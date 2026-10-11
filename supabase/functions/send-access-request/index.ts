import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessRequestPayload {
  requester_name: string;
  requester_email: string;
  requester_organization?: string;
  request_message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AccessRequestPayload = await req.json();
    console.log("Processing access request:", payload);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all admin users
    const { data: adminProfiles, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('role', 'admin');

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      throw new Error("Failed to fetch admin users");
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.error("No admin users found");
      throw new Error("No administrators configured");
    }

    const adminEmails = adminProfiles
      .map((profile: any) => profile.profiles.email)
      .filter((email: string) => email);

    console.log(`Sending access request to ${adminEmails.length} admins`);

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "Support Portal <onboarding@resend.dev>",
      to: adminEmails,
      subject: `New Access Request from ${payload.requester_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Access Request</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${payload.requester_name}</p>
            <p><strong>Email:</strong> ${payload.requester_email}</p>
            ${payload.requester_organization ? `<p><strong>Organization:</strong> ${payload.requester_organization}</p>` : ''}
            <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
              ${payload.request_message}
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              To approve or deny this request, please log in to the admin panel and navigate to User Management > Access Requests.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Access request sent to administrators",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-access-request function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
