import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Mail, Phone, Video, Trash2, ClipboardList, Search, Zap } from 'lucide-react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

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
  meeting_id: string | null;
  meeting_join_url: string | null;
  bos_submission_id: string | null;
}

interface AssessmentInfo {
  id: string;
  overall_score: number;
  estimated_hours_saved: number;
  business_type: string | null;
}

interface BOSSubmissionInfo {
  id: string;
  suggested_tier: string | null;
  estimated_price: number;
  estimated_hours_saved: number;
  selected_modules: string[];
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessmentMap, setAssessmentMap] = useState<Record<string, AssessmentInfo>>({});
  const [bosMap, setBosMap] = useState<Record<string, BOSSubmissionInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);
  const { toast } = useToast();

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    const today = startOfDay(new Date());
    
    return appointments
      .filter(apt => showCancelled || apt.status !== 'cancelled')
      .filter(apt => apt.guest_name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // Sort by date and time ascending (upcoming first)
        const dateA = parseISO(a.appointment_date);
        const dateB = parseISO(b.appointment_date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.appointment_time.localeCompare(b.appointment_time);
      });
  }, [appointments, searchQuery, showCancelled]);

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
      
      // Fetch linked assessments
      if (data && data.length > 0) {
        const appointmentIds = data.map(a => a.id);
        const { data: assessments } = await supabase
          .from('assessment_responses')
          .select('id, appointment_id, overall_score, estimated_hours_saved, business_type')
          .in('appointment_id', appointmentIds);
        
        if (assessments) {
          const map: Record<string, AssessmentInfo> = {};
          type AssessmentRow = { id: string; appointment_id: string | null; overall_score: number; estimated_hours_saved: number; business_type: string };
          assessments.forEach((a: AssessmentRow) => {
            if (a.appointment_id) {
              map[a.appointment_id] = {
                id: a.id,
                overall_score: a.overall_score,
                estimated_hours_saved: a.estimated_hours_saved,
                business_type: a.business_type,
              };
            }
          });
          setAssessmentMap(map);
        }

        // Fetch linked BOS submissions
        const bosIds = data.filter(a => a.bos_submission_id).map(a => a.bos_submission_id);
        if (bosIds.length > 0) {
          const { data: bosSubmissions } = await supabase
            .from('bos_builder_submissions')
            .select('id, suggested_tier, estimated_price, estimated_hours_saved, selected_modules')
            .in('id', bosIds);
          
          if (bosSubmissions) {
            const bosMapData: Record<string, BOSSubmissionInfo> = {};
            type BOSRow = { id: string; suggested_tier: string; estimated_price: number; estimated_hours_saved: number; selected_modules: unknown };
            // Map BOS submission ID to appointment ID
            data.forEach((apt: Appointment) => {
              if (apt.bos_submission_id) {
                const bosData = bosSubmissions.find((b: BOSRow) => b.id === apt.bos_submission_id);
                if (bosData) {
                  bosMapData[apt.id] = {
                    id: bosData.id,
                    suggested_tier: bosData.suggested_tier,
                    estimated_price: bosData.estimated_price,
                    estimated_hours_saved: bosData.estimated_hours_saved,
                    selected_modules: bosData.selected_modules as string[] || [],
                  };
                }
              }
            });
            setBosMap(bosMapData);
          }
        }
      }
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
      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-cancelled"
            checked={showCancelled}
            onCheckedChange={setShowCancelled}
          />
          <Label htmlFor="show-cancelled" className="text-sm text-muted-foreground">
            Show cancelled
          </Label>
        </div>
      </div>

      {/* Empty state after filtering */}
      {filteredAppointments.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No appointments match your search' : 'No active appointments'}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredAppointments.map((apt) => (
        <Card key={apt.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-foreground">{apt.guest_name}</h3>
                  <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                  {assessmentMap[apt.id] && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      <ClipboardList className="h-3 w-3 mr-1" />
                      Score: {assessmentMap[apt.id].overall_score}/100
                    </Badge>
                  )}
                  {bosMap[apt.id] && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                      <Zap className="h-3 w-3 mr-1" />
                      BOS: {bosMap[apt.id].suggested_tier}
                    </Badge>
                  )}
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
                {assessmentMap[apt.id] && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-muted px-2 py-1 rounded">
                      {assessmentMap[apt.id].estimated_hours_saved} hrs/week savings potential
                    </span>
                    {assessmentMap[apt.id].business_type && (
                      <span className="bg-muted px-2 py-1 rounded capitalize">
                        {assessmentMap[apt.id].business_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                )}
                {bosMap[apt.id] && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                      ${bosMap[apt.id].estimated_price.toLocaleString()} build
                    </span>
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                      {bosMap[apt.id].estimated_hours_saved} hrs/week saved
                    </span>
                    <span className="bg-muted px-2 py-1 rounded">
                      {bosMap[apt.id].selected_modules.length} modules selected
                    </span>
                  </div>
                )}
                {apt.notes && <p className="text-sm text-muted-foreground italic">{apt.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                {apt.meeting_join_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={apt.meeting_join_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-1" />
                      Join Meet
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
        ))
      )}
    </div>
  );
}
