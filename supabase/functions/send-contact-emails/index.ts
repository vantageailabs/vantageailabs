import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAccessToken, base64urlUtf8 } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
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
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google credentials
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const senderEmail = 'contact@vantageailabs.com';
    const notifyEmail = 'zach@vantageailabs.com';

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

    // Get access token with Gmail scope, impersonating the sender
    const accessToken = await getGoogleAccessToken(
      serviceAccount,
      ['https://www.googleapis.com/auth/gmail.send'],
      senderEmail
    );

    // 1. Send notification email to Zach
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #080b11;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #0c1018 0%, #111827 100%); border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
              <h1 style="color: #0ea5e9; margin: 0 0 24px 0; font-size: 24px;">New Contact Form Submission</h1>
              
              <div style="background: rgba(14, 165, 233, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">From:</p>
                <p style="color: #f1f5f9; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${name} (${email})</p>
                
                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">Subject:</p>
                <p style="color: #f1f5f9; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${subject}</p>
                
                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">Message:</p>
                <p style="color: #f1f5f9; margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to ${name}</a>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Sending notification email to:', notifyEmail);
    const notificationRfc822 = buildRfc822Email(senderEmail, notifyEmail, 'Zach', `[Contact Form] ${subject}`, notificationHtml);
    const encodedNotification = base64urlUtf8(notificationRfc822);

    const notificationResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedNotification }),
      }
    );

    if (!notificationResponse.ok) {
      const error = await notificationResponse.text();
      console.error('Gmail API error (notification):', error);
      throw new Error(`Failed to send notification email: ${error}`);
    }

    console.log('Notification email sent successfully');

    // 2. Send auto-response to the contact
    const autoResponseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #080b11;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #0c1018 0%, #111827 100%); border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #0ea5e9; margin: 0 0 8px 0; font-size: 28px;">Vantage AI Labs</h1>
                <p style="color: #64748b; margin: 0; font-size: 14px;">AI Automation for Small Business</p>
              </div>
              
              <h2 style="color: #f1f5f9; margin: 0 0 16px 0; font-size: 22px;">Thank you for contacting us, ${name}!</h2>
              
              <p style="color: #94a3b8; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                We've received your message and someone on our team will be reaching out shortly.
              </p>
              
              <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                In the meantime, if you'd rather schedule a call directly, you can do so at the link below:
              </p>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://vantageailabs.com/book" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Schedule a Call</a>
              </div>
              
              <p style="color: #64748b; margin: 0; font-size: 14px; text-align: center;">
                We look forward to speaking with you soon!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #475569; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Vantage AI Labs. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Sending auto-response email to:', email);
    const autoResponseRfc822 = buildRfc822Email(senderEmail, email, name, 'Thank you for contacting Vantage AI Labs', autoResponseHtml);
    const encodedAutoResponse = base64urlUtf8(autoResponseRfc822);

    const autoResponseResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedAutoResponse }),
      }
    );

    if (!autoResponseResponse.ok) {
      const error = await autoResponseResponse.text();
      console.error('Gmail API error (auto-response):', error);
      throw new Error(`Failed to send auto-response email: ${error}`);
    }

    console.log('Auto-response email sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in send-contact-emails:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
