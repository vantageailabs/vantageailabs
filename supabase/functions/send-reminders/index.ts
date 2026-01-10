import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format time for display
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Build reminder email HTML
function buildReminderEmail(
  guestName: string,
  appointmentDate: string,
  appointmentTime: string,
  duration: number,
  meetLink: string,
  cancelToken: string,
  reminderType: '24h' | '1h'
): string {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://vantageailabs.com';
  const cancelUrl = `${siteUrl}/cancel-appointment?token=${cancelToken}`;
  const rescheduleUrl = `${siteUrl}/reschedule?token=${cancelToken}`;
  
  const urgencyText = reminderType === '24h' 
    ? 'Your strategy call is tomorrow!' 
    : 'Your strategy call starts in 1 hour!';
  
  const headerEmoji = reminderType === '24h' ? '📅' : '⏰';
  const headerColor = reminderType === '1h' ? '#dc2626' : '#6366f1';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${headerEmoji} ${urgencyText}</h1>
      <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Vantage AI Labs - Reminder</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${guestName},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
        ${reminderType === '24h' 
          ? "This is a friendly reminder about your upcoming strategy call. We're looking forward to discussing how AI automation can transform your business!"
          : "Your strategy call is about to begin! Click the button below to join the meeting."}
      </p>
      
      <!-- Meeting Details Card -->
      <div style="background-color: ${reminderType === '1h' ? '#fef2f2' : '#f8f9fa'}; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid ${reminderType === '1h' ? '#fecaca' : '#e9ecef'};">
        <h3 style="color: ${reminderType === '1h' ? '#dc2626' : '#333'}; font-size: 16px; margin: 0 0 15px; font-weight: 600;">
          ${reminderType === '1h' ? '⏰ Starting Soon!' : '📅 Meeting Details'}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 100px;">Date:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${formatDate(appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Time:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${formatTime(appointmentTime)} (MST)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Duration:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${duration} minutes</td>
          </tr>
        </table>
      </div>
      
      <!-- Join Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meetLink}" style="display: inline-block; background: ${reminderType === '1h' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 14px ${reminderType === '1h' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(99, 102, 241, 0.4)'};">
          🎥 Join Google Meet
        </a>
        <p style="color: #666; font-size: 12px; margin: 10px 0 0;">
          ${reminderType === '1h' ? 'Click now to join your call!' : 'Save this link for tomorrow'}
        </p>
      </div>
      
      ${reminderType === '24h' ? `
      <!-- Preparation Tips -->
      <div style="margin: 30px 0;">
        <h3 style="color: #333; font-size: 16px; margin: 0 0 15px; font-weight: 600;">💡 Before Your Call</h3>
        <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Think about your biggest time-consuming tasks</li>
          <li>Consider which processes frustrate you the most</li>
          <li>Have any questions ready about AI automation</li>
          <li>Test your camera and microphone beforehand</li>
        </ul>
      </div>
      ` : ''}
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0;">
        See you ${reminderType === '24h' ? 'tomorrow' : 'soon'}!
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        Best regards,<br>
        <strong>Zach Witt</strong><br>
        <span style="color: #666; font-size: 14px;">Founder, Vantage AI Labs</span>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef;">
      <p style="color: #666; font-size: 13px; margin: 0 0 10px; text-align: center;">
        Need to make changes?
        <a href="${rescheduleUrl}" style="color: #6366f1; text-decoration: none;"> Reschedule</a> |
        <a href="${cancelUrl}" style="color: #6366f1; text-decoration: none;"> Cancel</a>
      </p>
      <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
        Questions? Reply to this email or contact zach@vantageailabs.com
      </p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Running reminder check at:', new Date().toISOString());

    // Get timezone from settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('timezone')
      .limit(1)
      .maybeSingle();

    const timezone = settings?.timezone || 'America/Denver';

    // Get current time in the configured timezone
    const now = new Date();
    
    // Calculate time windows
    // 24h reminder: appointments between 23-25 hours from now
    const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    // 1h reminder: appointments between 45-75 minutes from now
    const reminder1hStart = new Date(now.getTime() + 45 * 60 * 1000);
    const reminder1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

    // Fetch all confirmed appointments that haven't been reminded yet
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'confirmed')
      .or('reminder_24h_sent.eq.false,reminder_1h_sent.eq.false');

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to check`);

    let reminders24hSent = 0;
    let reminders1hSent = 0;

    for (const appointment of appointments || []) {
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);

      // Check for 24h reminder
      if (!appointment.reminder_24h_sent && 
          appointmentDateTime >= reminder24hStart && 
          appointmentDateTime <= reminder24hEnd) {
        
        console.log(`Sending 24h reminder for appointment ${appointment.id}`);
        
        try {
          const emailHtml = buildReminderEmail(
            appointment.guest_name,
            appointment.appointment_date,
            appointment.appointment_time,
            appointment.duration_minutes,
            appointment.meeting_join_url,
            appointment.cancel_token,
            '24h'
          );

          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: appointment.guest_email,
              toName: appointment.guest_name,
              subject: '📅 Reminder: Your Strategy Call is Tomorrow - Vantage AI Labs',
              htmlBody: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            await supabase
              .from('appointments')
              .update({ reminder_24h_sent: true })
              .eq('id', appointment.id);
            
            reminders24hSent++;
            console.log(`24h reminder sent for ${appointment.guest_email}`);
          } else {
            console.error(`Failed to send 24h reminder: ${await emailResponse.text()}`);
          }
        } catch (emailError) {
          console.error(`Error sending 24h reminder for ${appointment.id}:`, emailError);
        }
      }

      // Check for 1h reminder
      if (!appointment.reminder_1h_sent && 
          appointmentDateTime >= reminder1hStart && 
          appointmentDateTime <= reminder1hEnd) {
        
        console.log(`Sending 1h reminder for appointment ${appointment.id}`);
        
        try {
          const emailHtml = buildReminderEmail(
            appointment.guest_name,
            appointment.appointment_date,
            appointment.appointment_time,
            appointment.duration_minutes,
            appointment.meeting_join_url,
            appointment.cancel_token,
            '1h'
          );

          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: appointment.guest_email,
              toName: appointment.guest_name,
              subject: '⏰ Starting Soon: Your Strategy Call in 1 Hour - Vantage AI Labs',
              htmlBody: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            await supabase
              .from('appointments')
              .update({ reminder_1h_sent: true })
              .eq('id', appointment.id);
            
            reminders1hSent++;
            console.log(`1h reminder sent for ${appointment.guest_email}`);
          } else {
            console.error(`Failed to send 1h reminder: ${await emailResponse.text()}`);
          }
        } catch (emailError) {
          console.error(`Error sending 1h reminder for ${appointment.id}:`, emailError);
        }
      }
    }

    const summary = {
      checked_at: now.toISOString(),
      appointments_checked: appointments?.length || 0,
      reminders_24h_sent: reminders24hSent,
      reminders_1h_sent: reminders1hSent,
    };

    console.log('Reminder check complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in send-reminders:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
