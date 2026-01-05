import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { format, parse } from 'date-fns';

interface CapacityStatus {
  current_month: {
    month: string;
    max_clients: number;
    current_clients: number;
    remaining: number;
    is_full: boolean;
  };
  next_month: {
    month: string;
    max_clients: number;
    current_clients: number;
    remaining: number;
    is_full: boolean;
  };
  this_week: {
    available_slots: number;
    is_limited: boolean;
  };
}

export function CapacityBanner() {
  const [status, setStatus] = useState<CapacityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-capacity-status');
      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error('Error fetching capacity:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) return null;

  const currentMonthName = format(parse(status.current_month.month, 'yyyy-MM', new Date()), 'MMMM');
  const nextMonthName = format(parse(status.next_month.month, 'yyyy-MM', new Date()), 'MMMM');

  // Don't show if plenty of capacity
  if (status.current_month.remaining > 3 && !status.current_month.is_full) {
    return null;
  }

  const isFull = status.current_month.is_full;
  const remaining = status.current_month.remaining;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] py-3 px-4 text-center backdrop-blur-sm ${
      isFull 
        ? 'bg-destructive/20 border-b border-destructive/30' 
        : 'bg-primary/20 border-b border-primary/30 animate-scarcity-pulse'
    }`}>
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        {isFull ? (
          <>
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">
              {currentMonthName} is fully booked!
            </span>
            <span className="text-sm text-muted-foreground">
              Only <strong className="text-foreground">{status.next_month.remaining} spots</strong> available for {nextMonthName}.
            </span>
          </>
        ) : (
          <>
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              🔥 Limited Availability:
            </span>
            <span className="text-sm text-muted-foreground">
              Only <strong className="text-primary">{remaining} {remaining === 1 ? 'spot' : 'spots'}</strong> left for {currentMonthName}!
            </span>
          </>
        )}

        {status.this_week.is_limited && (
          <span className="text-sm text-muted-foreground flex items-center gap-1 ml-2">
            <Clock className="h-3 w-3" />
            {status.this_week.available_slots} call slots this week
          </span>
        )}
      </div>
    </div>
  );
}
