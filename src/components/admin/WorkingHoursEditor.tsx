import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AdminSettings {
  id: string;
  appointment_duration_minutes: number;
  buffer_minutes: number;
  advance_booking_days: number;
  timezone: string;
}

export function WorkingHoursEditor() {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [hoursRes, settingsRes] = await Promise.all([
        supabase.from('working_hours').select('*').order('day_of_week'),
        supabase.from('admin_settings').select('*').single(),
      ]);

      if (hoursRes.error) {
        toast({ title: 'Error loading working hours', description: hoursRes.error.message, variant: 'destructive' });
      } else {
        setWorkingHours(hoursRes.data || []);
      }

      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
        toast({ title: 'Error loading settings', description: settingsRes.error.message, variant: 'destructive' });
      } else {
        setSettings(settingsRes.data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const updateWorkingHour = (dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) => {
    setWorkingHours((prev) =>
      prev.map((wh) => (wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh))
    );
  };

  const saveWorkingHours = async () => {
    setSaving(true);
    
    for (const wh of workingHours) {
      const { error } = await supabase
        .from('working_hours')
        .update({
          start_time: wh.start_time,
          end_time: wh.end_time,
          is_available: wh.is_available,
        })
        .eq('id', wh.id);

      if (error) {
        toast({ title: 'Error saving working hours', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    if (settings) {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          appointment_duration_minutes: settings.appointment_duration_minutes,
          buffer_minutes: settings.buffer_minutes,
          advance_booking_days: settings.advance_booking_days,
        })
        .eq('id', settings.id);

      if (error) {
        toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    toast({ title: 'Settings saved successfully' });
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={settings?.appointment_duration_minutes || 30}
                onChange={(e) =>
                  setSettings((s) => s && { ...s, appointment_duration_minutes: parseInt(e.target.value) || 30 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer">Buffer (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                value={settings?.buffer_minutes || 15}
                onChange={(e) =>
                  setSettings((s) => s && { ...s, buffer_minutes: parseInt(e.target.value) || 15 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">Advance booking (days)</Label>
              <Input
                id="advance"
                type="number"
                value={settings?.advance_booking_days || 30}
                onChange={(e) =>
                  setSettings((s) => s && { ...s, advance_booking_days: parseInt(e.target.value) || 30 })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workingHours.map((wh) => (
            <div key={wh.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-28">
                <span className="font-medium text-foreground">{DAYS[wh.day_of_week]}</span>
              </div>
              <Switch
                checked={wh.is_available}
                onCheckedChange={(checked) => updateWorkingHour(wh.day_of_week, 'is_available', checked)}
              />
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={wh.start_time.slice(0, 5)}
                  onChange={(e) => updateWorkingHour(wh.day_of_week, 'start_time', e.target.value)}
                  disabled={!wh.is_available}
                  className="w-32"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={wh.end_time.slice(0, 5)}
                  onChange={(e) => updateWorkingHour(wh.day_of_week, 'end_time', e.target.value)}
                  disabled={!wh.is_available}
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveWorkingHours} disabled={saving} className="w-full md:w-auto">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  );
}
