import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, eachDayOfInterval, isBefore, startOfDay, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

export function BlockedDatesManager() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const addBlockedDates = async () => {
    if (!dateRange?.from) {
      toast({ title: 'Please select at least one date', variant: 'destructive' });
      return;
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;
    
    // Get all dates in the range
    const datesToBlock = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Filter out dates that are already blocked
    // Use date strings directly to avoid timezone issues
    const existingBlockedSet = new Set(blockedDates.map(bd => bd.blocked_date));
    const newDatesToBlock = datesToBlock.filter(date => {
      // Format using local date to match stored format
      const dateStr = format(date, 'yyyy-MM-dd');
      return !existingBlockedSet.has(dateStr);
    });

    if (newDatesToBlock.length === 0) {
      toast({ title: 'All selected dates are already blocked', variant: 'destructive' });
      return;
    }

    setAdding(true);
    
    const insertData = newDatesToBlock.map(date => ({
      blocked_date: format(date, 'yyyy-MM-dd'),
      reason: newReason || null,
    }));

    const { error } = await supabase.from('blocked_dates').insert(insertData);

    if (error) {
      toast({ title: 'Error adding blocked dates', description: error.message, variant: 'destructive' });
    } else {
      const count = newDatesToBlock.length;
      toast({ title: `${count} date${count > 1 ? 's' : ''} blocked` });
      setDateRange(undefined);
      setNewReason('');
      setIsOpen(false);
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

  const formatDateRangeDisplay = () => {
    if (!dateRange?.from) return 'Select dates';
    if (!dateRange.to || dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, 'MMM d, yyyy');
    }
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
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
              <Label>Date Range</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRangeDisplay()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <Button onClick={addBlockedDates} disabled={adding || !dateRange?.from}>
                <Plus className="h-4 w-4 mr-1" />
                Block Dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {blockedDates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No blocked dates</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {blockedDates.map((bd) => (
            <Card key={bd.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {format(parseISO(bd.blocked_date), 'EEEE, MMMM d, yyyy')}
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
