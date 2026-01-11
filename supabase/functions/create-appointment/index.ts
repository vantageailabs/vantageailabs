import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentRequest {
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM (24-hour format)
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  notes?: string;
  assessment_id?: string; // Optional assessment to link
}

interface AssessmentData {
  overall_score: number;
  estimated_hours_saved: number;
  estimated_monthly_savings: number;
}

// Create Google Calendar event with Meet link
async function createGoogleMeetEvent(
  accessToken: string,
  calendarId: string,
  eventData: {
    summary: string;
    startDateTime: string;
    duration: number;
    timezone: string;
    guestEmail: string;
    guestName: string;
  }
): Promise<{ meetLink: string; eventId: string }> {
  // Calculate end time
  const startDate = new Date(eventData.startDateTime);
  const endDate = new Date(startDate.getTime() + eventData.duration * 60000);

  const event = {
    summary: eventData.summary,
    description: `Strategy call with ${eventData.guestName}`,
    start: {
      dateTime: eventData.startDateTime,
      timeZone: eventData.timezone,
    },
    end: {
      dateTime: endDate.toISOString().replace('Z', ''),
      timeZone: eventData.timezone,
    },
    attendees: [
      { email: eventData.guestEmail, displayName: eventData.guestName }
    ],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    },
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    }
  };

  const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;

  const response = await fetch(calendarUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const createdEvent = await response.json();
  
  const meetLink = createdEvent.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === 'video'
  )?.uri;

  if (!meetLink) {
    console.error('No Meet link in response:', createdEvent);
    throw new Error('Google Meet link was not generated');
  }

  return {
    meetLink,
    eventId: createdEvent.id,
  };
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

// Build confirmation email HTML
function buildConfirmationEmail(
  guestName: string,
  appointmentDate: string,
  appointmentTime: string,
  duration: number,
  meetLink: string,
  cancelToken: string,
  assessment?: AssessmentData | null
): string {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://vantageailabs.com';
  const cancelUrl = `${siteUrl}/cancel-appointment?token=${cancelToken}`;
  const rescheduleUrl = `${siteUrl}/reschedule?token=${cancelToken}`;
  
  const assessmentSection = assessment ? `
      <!-- Assessment Results -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #bae6fd;">
        <h3 style="color: #0369a1; font-size: 16px; margin: 0 0 15px; font-weight: 600;">📊 Your AI Readiness Assessment Results</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          <div style="flex: 1; min-width: 140px; background: white; border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #6366f1;">${assessment.overall_score}%</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">AI Readiness Score</div>
          </div>
          <div style="flex: 1; min-width: 140px; background: white; border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #10b981;">${assessment.estimated_hours_saved}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Hours Saved/Month</div>
          </div>
          <div style="flex: 1; min-width: 140px; background: white; border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">$${assessment.estimated_monthly_savings.toLocaleString()}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Potential Monthly Savings</div>
          </div>
        </div>
        <p style="color: #0369a1; font-size: 13px; margin: 15px 0 0; text-align: center;">
          We'll discuss these results and your personalized automation roadmap during our call.
        </p>
      </div>` : '';

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
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Your Strategy Call is Confirmed! 🎉</h1>
      <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Vantage AI Labs</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${guestName},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
        Thank you for booking a strategy call! I'm excited to discuss how AI automation can transform your business operations.
      </p>
      
      <!-- Meeting Details Card -->
      <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e9ecef;">
        <h3 style="color: #333; font-size: 16px; margin: 0 0 15px; font-weight: 600;">📅 Meeting Details</h3>
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
        <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
          🎥 Join Google Meet
        </a>
        <p style="color: #666; font-size: 12px; margin: 10px 0 0;">
          Click the button above when it's time for your call
        </p>
      </div>
      
      ${assessmentSection}
      
      <!-- What to Expect -->
      <div style="margin: 30px 0;">
        <h3 style="color: #333; font-size: 16px; margin: 0 0 15px; font-weight: 600;">💡 What to Expect</h3>
        <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Deep dive into your current workflows and pain points</li>
          <li>Identification of high-impact automation opportunities</li>
          <li>Customized recommendations tailored to your business</li>
          <li>Clear next steps and implementation roadmap</li>
        </ul>
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
        Need to make changes?
        <a href="${rescheduleUrl}" style="color: #6366f1; text-decoration: none;"> Reschedule</a> |
        <a href="${cancelUrl}" style="color: #6366f1; text-decoration: none;"> Cancel appointment</a>
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

    const appointmentData: AppointmentRequest = await req.json();
    
    console.log('Creating appointment:', appointmentData);

    // Get admin settings for duration and timezone
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('appointment_duration_minutes, timezone')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error('Failed to fetch admin settings');
    }

    const duration = settings?.appointment_duration_minutes || 30;
    const timezone = settings?.timezone || 'America/New_York';

    // Check if the slot is available (not already booked)
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointmentData.appointment_date)
      .eq('appointment_time', appointmentData.appointment_time)
      .neq('status', 'cancelled');

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

    // Get Google credentials
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');

    if (!serviceAccountKey || !calendarId) {
      throw new Error('Google Calendar credentials not configured');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      throw new Error('Invalid service account key format');
    }

    // Create the Google Calendar event with Meet link
    const startDateTime = `${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`;
    
    // The calendar ID is typically the email of the calendar owner for workspace calendars
    // We need to impersonate this user for domain-wide delegation to work
    const impersonateEmail = calendarId.includes('@') ? calendarId : 'zach@vantageailabs.com';
    
    console.log('Getting Google access token with impersonation:', impersonateEmail);
    const accessToken = await getGoogleAccessToken(
      serviceAccount,
      ['https://www.googleapis.com/auth/calendar'],
      impersonateEmail
    );
    
    console.log('Creating Google Calendar event with Meet...');
    const { meetLink, eventId } = await createGoogleMeetEvent(accessToken, calendarId, {
      summary: `Strategy Call with ${appointmentData.guest_name}`,
      startDateTime,
      duration,
      timezone,
      guestEmail: appointmentData.guest_email,
      guestName: appointmentData.guest_name,
    });
    
    console.log('Google Meet created:', meetLink);

    // Insert the appointment with Meet details
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        duration_minutes: duration,
        guest_name: appointmentData.guest_name,
        guest_email: appointmentData.guest_email,
        guest_phone: appointmentData.guest_phone || null,
        notes: appointmentData.notes || null,
        status: 'confirmed',
        meeting_id: eventId,
        meeting_join_url: meetLink,
      })
      .select('*, cancel_token')
      .single();

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id);

    // Fetch assessment data if provided
    let assessmentData: AssessmentData | null = null;
    
    if (appointmentData.assessment_id) {
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessment_responses')
        .select('overall_score, estimated_hours_saved, estimated_monthly_savings')
        .eq('id', appointmentData.assessment_id)
        .single();
      
      if (!assessmentError && assessment) {
        assessmentData = assessment;
        console.log('Fetched assessment data:', assessmentData);
      }

      // Link assessment to this appointment
      const { error: updateError } = await supabase
        .from('assessment_responses')
        .update({ 
          appointment_id: appointment.id,
          email: appointmentData.guest_email 
        })
        .eq('id', appointmentData.assessment_id);

      if (updateError) {
        console.error('Error linking assessment:', updateError);
      } else {
        console.log('Assessment linked to appointment:', appointmentData.assessment_id);
      }
    }

    // Send confirmation email via Gmail API
    try {
      const emailHtml = buildConfirmationEmail(
        appointmentData.guest_name,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        duration,
        meetLink,
        appointment.cancel_token,
        assessmentData
      );

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: appointmentData.guest_email,
          toName: appointmentData.guest_name,
          subject: 'Your Strategy Call is Confirmed - Vantage AI Labs',
          htmlBody: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.error('Failed to send confirmation email:', emailError);
      } else {
        console.log('Confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: appointment.id,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          meeting_join_url: appointment.meeting_join_url,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in create-appointment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
