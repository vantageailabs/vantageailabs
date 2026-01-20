import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken, base64urlUtf8 } from "../_shared/google-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_REVIEW_URL = "https://g.page/r/CcO6hrI_AKIxEAI/review";

interface ReviewRequestPayload {
  client_id: string;
}

function buildRfc822Email(
  to: string,
  toName: string,
  subject: string,
  htmlBody: string
): string {
  const fromEmail = "zach@vantageailabs.com";
  const fromName = "Zach @ Vantage AI Labs";

  return [
    `From: ${fromName} <${fromEmail}>`,
    `To: ${toName} <${to}>`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    htmlBody,
  ].join("\r\n");
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { client_id }: ReviewRequestPayload = await req.json();

    if (!client_id) {
      return new Response(
        JSON.stringify({ error: "client_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, email, company")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstName = getFirstName(client.name);

    // Build the email HTML
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #18181b;">
                Hi ${firstName}! 👋
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                Thank you so much for choosing <strong>Vantage AI Labs</strong>! It was a pleasure working with you${client.company ? ` and the team at ${client.company}` : ""}.
              </p>
              
              <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                If you have a moment, we'd really appreciate it if you could share your experience with a quick Google review. It helps other business owners find us and means a lot to our small team.
              </p>
              
              <a href="${GOOGLE_REVIEW_URL}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                Leave a Review →
              </a>
              
              <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.5; color: #71717a;">
                Thanks again for your trust and support! 🙏
              </p>
              
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #71717a;">
                — Zach @ Vantage AI Labs
              </p>
            </td>
          </tr>
        </table>
        
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #a1a1aa;">
          Vantage AI Labs • AI Automation for Small Business
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const subject = `Quick favor, ${firstName}? 🙏`;

    // Get Google service account credentials
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    if (!serviceAccountJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Get access token with Gmail send scope, impersonating the sender
    const accessToken = await getGoogleAccessToken(
      serviceAccount,
      ["https://www.googleapis.com/auth/gmail.send"],
      "zach@vantageailabs.com"
    );

    // Build and encode the email
    const rawEmail = buildRfc822Email(client.email, client.name, subject, htmlBody);
    const encodedEmail = base64urlUtf8(rawEmail);

    // Send via Gmail API
    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedEmail }),
      }
    );

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error("Gmail API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    // Update client with review_request_sent_at timestamp
    const { error: updateError } = await supabase
      .from("clients")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", client_id);

    if (updateError) {
      console.error("Error updating client:", updateError);
      // Don't fail the request since email was sent successfully
    }

    console.log(`Review request sent to ${client.email} for client ${client_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Review request sent!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-review-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
