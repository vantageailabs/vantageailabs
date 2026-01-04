import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check, X, RefreshCw, Loader2, Clock } from 'lucide-react';

interface BusyPeriod {
  start: string;
  end: string;
}

interface AdminSettings {
  timezone: string;
}

export function CalendarStatus() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busyPeriods, setBusyPeriods] = useState<BusyPeriod[]>([]);
  const [timezone, setTimezone] = useState('America/Denver');
  const { toast } = useToast();

  const fetchCalendarStatus = async () => {
    try {
      // Get admin settings for timezone
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('timezone')
        .limit(1)
        .single();

      if (settings?.timezone) {
        setTimezone(settings.timezone);
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch calendar events for today
      const { data, error } = await supabase.functions.invoke('fetch-calendar-events', {
        body: { date: today, timezone: settings?.timezone || 'America/Denver' },
      });

      if (error) {
        console.error('Calendar status error:', error);
        setConnected(false);
        setBusyPeriods([]);
      } else {
        setConnected(data?.configured || false);
        setBusyPeriods(data?.busyPeriods || []);
      }
    } catch (err) {
      console.error('Failed to fetch calendar status:', err);
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendarStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCalendarStatus();
    toast({ title: 'Calendar refreshed' });
  };

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Google Calendar
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-foreground">Connected to Google Calendar</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Not connected</span>
            </>
          )}
        </div>

        {/* Timezone */}
        <div className="text-xs text-muted-foreground">
          Timezone: {timezone}
        </div>

        {/* Today's Busy Periods */}
        {connected && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today's Busy Periods
            </h4>
            {busyPeriods.length > 0 ? (
              <div className="space-y-1">
                {busyPeriods.map((period, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md"
                  >
                    {formatTime(period.start)} – {formatTime(period.end)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events scheduled for today</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
