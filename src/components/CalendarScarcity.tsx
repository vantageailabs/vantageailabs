import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, AlertCircle } from 'lucide-react';

interface CapacityStatus {
  this_week: {
    available_slots: number;
    is_limited: boolean;
  };
}

export function CalendarScarcity() {
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

  const { available_slots, is_limited } = status.this_week;

  if (!is_limited && available_slots > 10) return null;

  return (
    <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm ${
      available_slots <= 3 
        ? 'bg-destructive/10 text-destructive border border-destructive/20' 
        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    }`}>
      {available_slots <= 3 ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span>
        {available_slots <= 3 
          ? `Only ${available_slots} slots left this week!`
          : `${available_slots} call slots available this week`
        }
      </span>
    </div>
  );
}
