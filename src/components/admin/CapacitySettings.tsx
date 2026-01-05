import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, TrendingUp, Calendar } from 'lucide-react';
import { format, addMonths, startOfMonth, parse } from 'date-fns';

interface MonthlyCapacity {
  id: string;
  year_month: string;
  max_clients: number;
  artificial_clients: number;
  notes: string | null;
}

interface MonthStat {
  year_month: string;
  max_clients: number;
  current_clients: number;
  artificial_clients: number;
  notes: string | null;
  capacity_id: string | null;
}

export function CapacitySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultCapacity, setDefaultCapacity] = useState(5);
  const [monthStats, setMonthStats] = useState<MonthStat[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCapacityData();
  }, []);

  const fetchCapacityData = async () => {
    setLoading(true);

    // Fetch default capacity from admin_settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('default_monthly_capacity')
      .limit(1)
      .maybeSingle();

    if (settings?.default_monthly_capacity) {
      setDefaultCapacity(settings.default_monthly_capacity);
    }

    // Generate next 6 months
    const months: string[] = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const monthDate = addMonths(startOfMonth(today), i);
      months.push(format(monthDate, 'yyyy-MM'));
    }

    // Fetch capacity overrides
    const { data: capacities } = await supabase
      .from('monthly_capacity')
      .select('*')
      .in('year_month', months);

    // Fetch client counts per month
    const { data: clients } = await supabase
      .from('clients')
      .select('start_month, status')
      .in('status', ['active', 'prospect']);

    // Build stats
    const stats: MonthStat[] = months.map((ym) => {
      const capacity = (capacities as MonthlyCapacity[] | null)?.find(c => c.year_month === ym);
      const clientCount = clients?.filter(c => {
        if (!c.start_month) return false;
        return c.start_month.startsWith(ym);
      }).length || 0;

      return {
        year_month: ym,
        max_clients: capacity?.max_clients ?? settings?.default_monthly_capacity ?? 5,
        current_clients: clientCount,
        artificial_clients: capacity?.artificial_clients ?? 0,
        notes: capacity?.notes || null,
        capacity_id: capacity?.id || null,
      };
    });

    setMonthStats(stats);
    setLoading(false);
  };

  const handleSaveDefault = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('admin_settings')
      .update({ default_monthly_capacity: defaultCapacity })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

    if (error) {
      toast({ title: 'Error saving default', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Default capacity updated!' });
      fetchCapacityData();
    }
    setSaving(false);
  };

  const handleUpdateMonth = async (stat: MonthStat, updates: { max_clients?: number; artificial_clients?: number }) => {
    if (stat.capacity_id) {
      // Update existing
      const { error } = await supabase
        .from('monthly_capacity')
        .update(updates)
        .eq('id', stat.capacity_id);

      if (error) {
        toast({ title: 'Error updating capacity', description: error.message, variant: 'destructive' });
        return;
      }
    } else {
      // Insert new override
      const { error } = await supabase.from('monthly_capacity').insert({
        year_month: stat.year_month,
        max_clients: updates.max_clients ?? stat.max_clients,
        artificial_clients: updates.artificial_clients ?? 0,
      });

      if (error) {
        toast({ title: 'Error setting capacity', description: error.message, variant: 'destructive' });
        return;
      }
    }

    fetchCapacityData();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading capacity data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Default Setting */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Default Monthly Capacity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultCap">Max clients per month (default)</Label>
            <Input
              id="defaultCap"
              type="number"
              className="w-24"
              value={defaultCapacity}
              onChange={(e) => setDefaultCapacity(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSaveDefault} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Default
          </Button>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Capacity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monthStats.map((stat) => {
              const totalClients = stat.current_clients + stat.artificial_clients;
              const percentage = stat.max_clients > 0 
                ? Math.min((totalClients / stat.max_clients) * 100, 100)
                : 0;
              const remaining = Math.max(stat.max_clients - totalClients, 0);
              const isFull = remaining === 0;

              return (
                <Card key={stat.year_month} className={`border-border/50 ${isFull ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {format(parse(stat.year_month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                      </span>
                      {isFull && (
                        <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive font-medium">
                          FULL
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {totalClients} / {stat.max_clients} clients
                          {stat.artificial_clients > 0 && (
                            <span className="text-yellow-600 ml-1">
                              ({stat.current_clients} real + {stat.artificial_clients} artificial)
                            </span>
                          )}
                        </span>
                        <span className={`font-medium ${isFull ? 'text-destructive' : 'text-primary'}`}>
                          {remaining} spots left
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Max:</Label>
                        <Input
                          type="number"
                          className="h-8 w-20"
                          value={stat.max_clients}
                          onChange={(e) => {
                            const newStats = monthStats.map(s => 
                              s.year_month === stat.year_month 
                                ? { ...s, max_clients: Number(e.target.value) }
                                : s
                            );
                            setMonthStats(newStats);
                          }}
                          onBlur={(e) => handleUpdateMonth(stat, { max_clients: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-yellow-600 whitespace-nowrap">Artificial:</Label>
                        <Input
                          type="number"
                          className="h-8 w-20 border-yellow-500/50"
                          value={stat.artificial_clients}
                          onChange={(e) => {
                            const newStats = monthStats.map(s => 
                              s.year_month === stat.year_month 
                                ? { ...s, artificial_clients: Number(e.target.value) }
                                : s
                            );
                            setMonthStats(newStats);
                          }}
                          onBlur={(e) => handleUpdateMonth(stat, { artificial_clients: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
