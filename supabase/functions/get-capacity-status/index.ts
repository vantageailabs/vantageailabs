import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Fetching capacity for ${currentMonth} and ${nextMonth}`);

    // Get default capacity from admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('default_monthly_capacity')
      .limit(1)
      .maybeSingle();

    const defaultCapacity = settings?.default_monthly_capacity || 5;

    // Get capacity overrides for current and next month
    const { data: capacities } = await supabase
      .from('monthly_capacity')
      .select('*')
      .in('year_month', [currentMonth, nextMonthStr]);

    // Count active/prospect clients for current and next month
    const { data: clients } = await supabase
      .from('clients')
      .select('start_month')
      .in('status', ['active', 'prospect'])
      .not('start_month', 'is', null);

    const currentMonthCapacity = capacities?.find(c => c.year_month === currentMonth)?.max_clients ?? defaultCapacity;
    const nextMonthCapacity = capacities?.find(c => c.year_month === nextMonthStr)?.max_clients ?? defaultCapacity;

    const currentMonthClients = clients?.filter(c => c.start_month?.startsWith(currentMonth)).length || 0;
    const nextMonthClients = clients?.filter(c => c.start_month?.startsWith(nextMonthStr)).length || 0;

    const currentMonthRemaining = Math.max(currentMonthCapacity - currentMonthClients, 0);
    const nextMonthRemaining = Math.max(nextMonthCapacity - nextMonthClients, 0);

    // Get available appointment slots for this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_date')
      .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
      .lte('appointment_date', endOfWeek.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed']);

    const bookedThisWeek = appointments?.length || 0;

    // Estimate available slots (rough: 5 days × 4 slots per day)
    const estimatedTotalSlots = 20;
    const availableThisWeek = Math.max(estimatedTotalSlots - bookedThisWeek, 0);

    const response = {
      current_month: {
        month: currentMonth,
        max_clients: currentMonthCapacity,
        current_clients: currentMonthClients,
        remaining: currentMonthRemaining,
        is_full: currentMonthRemaining === 0,
      },
      next_month: {
        month: nextMonthStr,
        max_clients: nextMonthCapacity,
        current_clients: nextMonthClients,
        remaining: nextMonthRemaining,
        is_full: nextMonthRemaining === 0,
      },
      this_week: {
        available_slots: availableThisWeek,
        is_limited: availableThisWeek <= 5,
      },
    };

    console.log('Capacity response:', JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching capacity:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
