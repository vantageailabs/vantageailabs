import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

export function BlockedDatesManager() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchBlockedDates = async () => {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true });

    if (error) {
      toast({ title: 'Error loading blocked dates', description: error.message, variant: 'destructive' });
    } else {
      setBlockedDates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const addBlockedDate = async () => {
    if (!newDate) {
      toast({ title: 'Please select a date', variant: 'destructive' });
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('blocked_dates').insert({
      blocked_date: newDate,
      reason: newReason || null,
    });

    if (error) {
      toast({ title: 'Error adding blocked date', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Blocked date added' });
      setNewDate('');
      setNewReason('');
      fetchBlockedDates();
    }
    setAdding(false);
  };

  const removeBlockedDate = async (id: string) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error removing blocked date', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Blocked date removed' });
      fetchBlockedDates();
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading blocked dates...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="blocked-date">Date</Label>
              <Input
                id="blocked-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="blocked-reason">Reason (optional)</Label>
              <Input
                id="blocked-reason"
                placeholder="e.g., Holiday, Vacation"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addBlockedDate} disabled={adding}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {blockedDates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No blocked dates</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {blockedDates.map((bd) => (
            <Card key={bd.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(bd.blocked_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    {bd.reason && <p className="text-sm text-muted-foreground">{bd.reason}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeBlockedDate(bd.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
