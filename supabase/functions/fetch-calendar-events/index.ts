import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusyPeriod {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

interface CalendarEvent {
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

// Convert ISO datetime to HH:MM in a specific timezone
function getTimeFromISO(isoString: string, timezone: string): string {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  });
  return formatter.format(date);
}

// Get date string (YYYY-MM-DD) from ISO in a specific timezone
function getDateFromISO(isoString: string, timezone: string): string {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  });
  return formatter.format(date);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, timezone = 'America/New_York' } = await req.json();
    
    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Date is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching calendar events for date: ${date}, timezone: ${timezone}`);

    // Get Google credentials from secrets
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');

    if (!serviceAccountKey || !calendarId) {
      console.log('Google Calendar credentials not configured, returning empty busy periods');
      // Gracefully return empty array if not configured
      return new Response(
        JSON.stringify({ busyPeriods: [], configured: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse service account key
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid service account key format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create JWT for Google API authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: 'RS256', typ: 'JWT' };
    const jwtClaim = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // 1 hour
    };

    // Base64URL encode helper
    const base64url = (str: string) => 
      btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const encodedHeader = base64url(JSON.stringify(jwtHeader));
    const encodedClaim = base64url(JSON.stringify(jwtClaim));
    const signatureInput = `${encodedHeader}.${encodedClaim}`;

    // Import the private key and sign
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
      console.error('Token exchange failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Google' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Calculate time range for the date (full day in the specified timezone)
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    
    // Fetch events from Google Calendar
    const calendarUrl = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    );
    calendarUrl.searchParams.set('timeMin', startOfDay.toISOString());
    calendarUrl.searchParams.set('timeMax', endOfDay.toISOString());
    calendarUrl.searchParams.set('singleEvents', 'true');
    calendarUrl.searchParams.set('orderBy', 'startTime');

    const eventsResponse = await fetch(calendarUrl.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!eventsResponse.ok) {
      const error = await eventsResponse.text();
      console.error('Failed to fetch calendar events:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch calendar events' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventsData = await eventsResponse.json();
    const events: CalendarEvent[] = eventsData.items || [];

    console.log(`Found ${events.length} events for ${date}`);

    // Extract busy periods from events
    const busyPeriods: BusyPeriod[] = events
      .filter((event: CalendarEvent) => {
        // Skip all-day events (they have 'date' instead of 'dateTime')
        return event.start?.dateTime && event.end?.dateTime;
      })
      .map((event: CalendarEvent) => {
        const eventStartDate = getDateFromISO(event.start.dateTime!, timezone);
        const eventEndDate = getDateFromISO(event.end.dateTime!, timezone);
        
        // Handle events that might span midnight
        let start = '00:00';
        let end = '23:59';
        
        if (eventStartDate === date) {
          start = getTimeFromISO(event.start.dateTime!, timezone);
        }
        if (eventEndDate === date) {
          end = getTimeFromISO(event.end.dateTime!, timezone);
        }
        
        return { start, end };
      });

    console.log('Busy periods:', busyPeriods);

    return new Response(
      JSON.stringify({ busyPeriods, configured: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-calendar-events:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});