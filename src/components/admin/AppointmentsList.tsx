import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Mail, Phone, User, Video, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      toast({ title: 'Error loading appointments', description: error.message, variant: 'destructive' });
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error cancelling appointment', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Appointment cancelled' });
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No appointments yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <Card key={apt.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{apt.guest_name}</h3>
                  <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(apt.appointment_date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {apt.appointment_time.slice(0, 5)} ({apt.duration_minutes}min)
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {apt.guest_email}
                  </span>
                  {apt.guest_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {apt.guest_phone}
                    </span>
                  )}
                </div>
                {apt.notes && <p className="text-sm text-muted-foreground italic">{apt.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                {apt.zoom_start_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={apt.zoom_start_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-1" />
                      Start Zoom
                    </a>
                  </Button>
                )}
                {apt.status !== 'cancelled' && (
                  <Button variant="destructive" size="sm" onClick={() => cancelAppointment(apt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
