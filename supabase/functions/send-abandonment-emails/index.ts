import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildAbandonmentEmail(name: string | null): string {
  const displayName = name || 'there';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Strategy Call Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); padding: 12px 24px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 20px; color: white;">Vantage AI Labs</span>
      </div>
    </div>

    <!-- Main Content -->
    <div style="background-color: #171717; border-radius: 16px; padding: 40px; border: 1px solid #262626;">
      
      <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
        Hey ${displayName} 👋
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #a3a3a3;">
        I noticed you started booking a strategy call but didn't finish. No worries – I know how busy things get!
      </p>

      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #a3a3a3;">
        If you're still interested in exploring how AI can save you 15-20 hours per week and potentially add $50K+ to your bottom line, I'd love to chat.
      </p>

      <!-- Benefits Box -->
      <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 28px 0; border-left: 4px solid #f97316;">
        <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #ffffff;">
          In our 30-minute call, we'll cover:
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #d4d4d4;">
          <li style="margin-bottom: 8px;">Your biggest time-wasters and how to automate them</li>
          <li style="margin-bottom: 8px;">Quick wins you can implement this week</li>
          <li style="margin-bottom: 8px;">A custom AI roadmap for your business</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://vantageailabs.com/#booking" 
           style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 40px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
          Complete Your Booking →
        </a>
      </div>

      <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #737373; text-align: center;">
        Only a few spots available this month. No pressure – just an honest conversation about what's possible.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #262626;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #737373;">
        Zach Tschetter, Founder
      </p>
      <p style="margin: 0; font-size: 12px; color: #525252;">
        Vantage AI Labs • AI Automation for Small Business
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find abandoned sessions with email that haven't been contacted
    // Sessions older than 30 minutes that aren't completed
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: abandonedSessions, error: fetchError } = await supabase
      .from('form_analytics')
      .select('*')
      .not('partial_email', 'is', null)
      .eq('completed', false)
      .eq('abandoned', false) // Not yet marked as abandoned/contacted
      .lt('updated_at', thirtyMinutesAgo)
      .gt('created_at', twentyFourHoursAgo) // Only sessions from last 24 hours
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch abandoned sessions: ${fetchError.message}`);
    }

    console.log(`Found ${abandonedSessions?.length || 0} abandoned sessions to follow up`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const session of abandonedSessions || []) {
      try {
        // Send follow-up email via the existing send-email function
        const emailResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: session.partial_email,
              toName: session.partial_name || undefined,
              subject: "Still interested in saving 15+ hours/week? 🚀",
              htmlBody: buildAbandonmentEmail(session.partial_name),
            }),
          }
        );

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(errorText);
        }

        // Mark session as abandoned (contacted)
        await supabase
          .from('form_analytics')
          .update({ abandoned: true })
          .eq('id', session.id);

        results.push({ email: session.partial_email, success: true });
        console.log(`Sent abandonment email to: ${session.partial_email}`);

      } catch (emailError: unknown) {
        const message = emailError instanceof Error ? emailError.message : 'Unknown error';
        results.push({ email: session.partial_email, success: false, error: message });
        console.error(`Failed to send to ${session.partial_email}:`, message);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        sent: successCount,
        failed: failCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-abandonment-emails:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
