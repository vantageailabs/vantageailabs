import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RescheduleRequest {
  token: string;
  new_date: string; // YYYY-MM-DD
  new_time: string; // HH:MM
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET request to fetch appointment details
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const token = url.searchParams.get('token');

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Missing token parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('id, guest_name, guest_email, appointment_date, appointment_time, status, duration_minutes')
        .eq('cancel_token', token)
        .single();

      if (error || !appointment) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ appointment }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error: unknown) {
      console.error('Error fetching appointment:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Handle POST request to reschedule
  try {
    const { token, new_date, new_time }: RescheduleRequest = await req.json();

    if (!token || !new_date || !new_time) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: token, new_date, new_time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find appointment by cancel token
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('cancel_token', token)
      .single();

    if (fetchError || !appointment) {
      console.error('Appointment not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Appointment not found or invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'This appointment has been cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if original appointment is in the past
    const originalDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    if (originalDateTime < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cannot reschedule past appointments' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if new slot is available
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', new_date)
      .eq('appointment_time', new_time)
      .neq('status', 'cancelled')
      .neq('id', appointment.id);

    if (checkError) {
      console.error('Error checking availability:', checkError);
      throw new Error('Failed to check slot availability');
    }

    if (existingAppointments && existingAppointments.length > 0) {
      return new Response(
        JSON.stringify({ error: 'This time slot is no longer available' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin settings for timezone
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('timezone')
      .limit(1)
      .maybeSingle();

    const timezone = settings?.timezone || 'America/New_York';

    // Update Google Calendar event if we have the meeting_id
    let newMeetLink = appointment.meeting_join_url;
    if (appointment.meeting_id) {
      try {
        const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
        const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');

        if (serviceAccountKey && calendarId) {
          const serviceAccount = JSON.parse(serviceAccountKey);
          const accessToken = await getGoogleAccessToken(
            serviceAccount,
            ['https://www.googleapis.com/auth/calendar']
          );

          const startDateTime = `${new_date}T${new_time}:00`;
          const startDate = new Date(startDateTime);
          const endDate = new Date(startDate.getTime() + appointment.duration_minutes * 60000);

          const updateUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${appointment.meeting_id}?sendUpdates=all`;
          
          const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              start: {
                dateTime: startDateTime,
                timeZone: timezone,
              },
              end: {
                dateTime: endDate.toISOString().replace('Z', ''),
                timeZone: timezone,
              },
            }),
          });

          if (!updateResponse.ok) {
            console.error('Failed to update calendar event:', await updateResponse.text());
          } else {
            const updatedEvent = await updateResponse.json();
            console.log('Calendar event updated:', appointment.meeting_id);
            
            // Get the meet link from the updated event
            const meetLink = updatedEvent.conferenceData?.entryPoints?.find(
              (ep: any) => ep.entryPointType === 'video'
            )?.uri;
            if (meetLink) {
              newMeetLink = meetLink;
            }
          }
        }
      } catch (calendarError) {
        console.error('Error updating calendar event:', calendarError);
        // Don't fail the reschedule if calendar update fails
      }
    }

    // Update appointment in database
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        appointment_date: new_date,
        appointment_time: new_time,
        meeting_join_url: newMeetLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointment.id);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      throw new Error('Failed to reschedule appointment');
    }

    console.log('Appointment rescheduled:', appointment.id);

    // Send reschedule confirmation email
    try {
      const siteUrl = Deno.env.get('SITE_URL') || 'https://vantageailabs.com';
      const cancelUrl = `${siteUrl}/cancel-appointment?token=${appointment.cancel_token}`;
      const rescheduleUrl = `${siteUrl}/reschedule?token=${appointment.cancel_token}`;
      
      const emailHtml = `
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
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Your Appointment Has Been Rescheduled 📅</h1>
      <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Vantage AI Labs</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${appointment.guest_name},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
        Your strategy call has been successfully rescheduled to the new date and time below.
      </p>
      
      <!-- New Meeting Details -->
      <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #bbf7d0;">
        <h3 style="color: #166534; font-size: 16px; margin: 0 0 15px; font-weight: 600;">✅ New Meeting Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 100px;">Date:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${formatDate(new_date)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Time:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${formatTime(new_time)} (MST)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Duration:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${appointment.duration_minutes} minutes</td>
          </tr>
        </table>
      </div>
      
      <!-- Previous Time (strikethrough) -->
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 15px; margin: 15px 0; border: 1px solid #fecaca;">
        <p style="color: #991b1b; font-size: 13px; margin: 0;">
          <strong>Previous:</strong> <span style="text-decoration: line-through;">${formatDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}</span>
        </p>
      </div>
      
      <!-- Join Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${newMeetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
          🎥 Join Google Meet
        </a>
        <p style="color: #666; font-size: 12px; margin: 10px 0 0;">
          Click the button above when it's time for your call
        </p>
      </div>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0;">
        Looking forward to speaking with you!
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
        Need to make more changes?
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

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: appointment.guest_email,
          toName: appointment.guest_name,
          subject: 'Your Appointment Has Been Rescheduled - Vantage AI Labs',
          htmlBody: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send reschedule email:', await emailResponse.text());
      } else {
        console.log('Reschedule confirmation email sent');
      }
    } catch (emailError) {
      console.error('Error sending reschedule email:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Appointment rescheduled successfully',
        appointment: {
          id: appointment.id,
          guest_name: appointment.guest_name,
          appointment_date: new_date,
          appointment_time: new_time,
          meeting_join_url: newMeetLink,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in reschedule-appointment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
