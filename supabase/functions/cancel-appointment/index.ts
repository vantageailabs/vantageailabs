import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing cancel token' }),
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
        JSON.stringify({ error: 'This appointment has already been cancelled', appointment }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    if (appointmentDateTime < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cannot cancel past appointments' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete Google Calendar event if we have the meeting_id
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

          const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${appointment.meeting_id}?sendUpdates=all`;
          
          const deleteResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error('Failed to delete calendar event:', await deleteResponse.text());
          } else {
            console.log('Calendar event deleted:', appointment.meeting_id);
          }
        }
      } catch (calendarError) {
        console.error('Error deleting calendar event:', calendarError);
        // Don't fail the cancellation if calendar deletion fails
      }
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', appointment.id);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      throw new Error('Failed to cancel appointment');
    }

    console.log('Appointment cancelled:', appointment.id);

    // Send cancellation confirmation email
    try {
      const siteUrl = Deno.env.get('SITE_URL') || 'https://vantageailabs.com';
      
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
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Appointment Cancelled</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${appointment.guest_name},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Your strategy call has been successfully cancelled.
      </p>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #666; font-size: 14px; margin: 0 0 10px;">
          <strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p style="color: #666; font-size: 14px; margin: 0;">
          <strong>Time:</strong> ${appointment.appointment_time}
        </p>
      </div>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        If you'd like to reschedule, you can book a new appointment anytime.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${siteUrl}/#booking" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Book New Appointment
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #666; font-size: 14px; margin: 0 0 10px;">
        Vantage AI Labs
      </p>
      <p style="color: #999; font-size: 12px; margin: 0;">
        Questions? Reply to this email or contact zach@vantageailabs.com
      </p>
    </div>
  </div>
</body>
</html>`;

      // Call the send-email function
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: appointment.guest_email,
          toName: appointment.guest_name,
          subject: 'Appointment Cancelled - Vantage AI Labs',
          htmlBody: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send cancellation email:', await emailResponse.text());
      } else {
        console.log('Cancellation email sent');
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't fail if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Appointment cancelled successfully',
        appointment: {
          id: appointment.id,
          guest_name: appointment.guest_name,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in cancel-appointment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
