import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAccessToken, base64url } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  toName?: string;
}

// Build RFC822 email message
function buildRfc822Email(from: string, to: string, toName: string | undefined, subject: string, htmlBody: string): string {
  const boundary = `boundary_${crypto.randomUUID().replace(/-/g, '')}`;
  
  const toHeader = toName ? `"${toName}" <${to}>` : to;
  
  const message = [
    `From: "Vantage AI Labs" <${from}>`,
    `To: ${toHeader}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(htmlBody))),
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  return message;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody, toName }: EmailRequest = await req.json();

    if (!to || !subject || !htmlBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, htmlBody' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google credentials
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const senderEmail = 'zach@vantageailabs.com';

    if (!serviceAccountKey) {
      throw new Error('Google service account credentials not configured');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      throw new Error('Invalid service account key format');
    }

    console.log(`Sending email to: ${to}, Subject: ${subject}`);

    // Get access token with Gmail scope, impersonating the sender
    const accessToken = await getGoogleAccessToken(
      serviceAccount,
      ['https://www.googleapis.com/auth/gmail.send'],
      senderEmail
    );

    // Build RFC822 email
    const rfc822Email = buildRfc822Email(senderEmail, to, toName, subject, htmlBody);
    
    // Base64URL encode the email for Gmail API
    const encodedEmail = base64url(rfc822Email);

    // Send via Gmail API
    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedEmail }),
      }
    );

    if (!gmailResponse.ok) {
      const error = await gmailResponse.text();
      console.error('Gmail API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await gmailResponse.json();
    console.log('Email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in send-email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
