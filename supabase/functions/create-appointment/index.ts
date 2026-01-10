import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Helper: Base64URL encode
function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Get Google access token using service account
async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const jwtClaim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64url(JSON.stringify(jwtHeader));
  const encodedClaim = base64url(JSON.stringify(jwtClaim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Import and sign with private key
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Google token exchange failed:', error);
    throw new Error('Failed to authenticate with Google');
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
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
    
    console.log('Getting Google access token...');
    const accessToken = await getGoogleAccessToken(serviceAccount);
    
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
      .select()
      .single();

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id);

    // If there's a pending assessment, link it to this appointment
    if (appointmentData.assessment_id) {
      const { error: updateError } = await supabase
        .from('assessment_responses')
        .update({ 
          appointment_id: appointment.id,
          email: appointmentData.guest_email 
        })
        .eq('id', appointmentData.assessment_id);

      if (updateError) {
        console.error('Error linking assessment:', updateError);
        // Don't fail the appointment creation, just log the error
      } else {
        console.log('Assessment linked to appointment:', appointmentData.assessment_id);
      }
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
