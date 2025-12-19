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

    // Create the Zoom meeting
    const startDateTime = `${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`;
    
    const zoomFunctionUrl = `${supabaseUrl}/functions/v1/create-zoom-meeting`;
    
    const zoomResponse = await fetch(zoomFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        topic: `Strategy Call with ${appointmentData.guest_name}`,
        start_time: startDateTime,
        duration: duration,
        timezone: timezone,
        guest_email: appointmentData.guest_email,
        guest_name: appointmentData.guest_name,
      }),
    });

    if (!zoomResponse.ok) {
      const zoomError = await zoomResponse.text();
      console.error('Zoom meeting creation failed:', zoomError);
      throw new Error('Failed to create Zoom meeting');
    }

    const zoomData = await zoomResponse.json();
    console.log('Zoom meeting created:', zoomData);

    // Insert the appointment with Zoom details
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
        zoom_meeting_id: zoomData.meeting_id,
        zoom_join_url: zoomData.join_url,
        zoom_start_url: zoomData.start_url,
        zoom_password: zoomData.password,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id);

    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: appointment.id,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          zoom_join_url: appointment.zoom_join_url,
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
