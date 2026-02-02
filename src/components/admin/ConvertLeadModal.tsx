import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ClipboardList, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Lead {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

interface Assessment {
  id: string;
  email: string | null;
  overall_score: number;
  estimated_hours_saved: number;
  business_type: string | null;
  created_at: string;
}

interface Appointment {
  id: string;
  guest_name: string;
  guest_email: string;
  appointment_date: string;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConverted: () => void;
}

export function ConvertLeadModal({ open, onClose, onConverted }: Props) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    start_month: '',
  });

  useEffect(() => {
    if (open) {
      fetchData();
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setStep('select');
    setSelectedLead(null);
    setSelectedAssessment(null);
    setSelectedAppointment(null);
    setFormData({ name: '', email: '', phone: '', company: '', start_month: '' });
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch leads that haven't been converted
    const { data: existingClients } = await supabase
      .from('clients')
      .select('lead_id, assessment_id, initial_appointment_id');
    
    const usedLeadIds = existingClients?.map(c => c.lead_id).filter(Boolean) || [];
    const usedAssessmentIds = existingClients?.map(c => c.assessment_id).filter(Boolean) || [];
    const usedAppointmentIds = existingClients?.map(c => c.initial_appointment_id).filter(Boolean) || [];

    const [leadsRes, assessmentsRes, appointmentsRes] = await Promise.all([
      supabase.from('lead_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('assessment_responses').select('*').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
    ]);

    // Filter out already converted ones and cancelled appointments
    setLeads((leadsRes.data || []).filter((l: Lead) => !usedLeadIds.includes(l.id)));
    setAssessments((assessmentsRes.data || []).filter((a: Assessment) => !usedAssessmentIds.includes(a.id)));
    setAppointments((appointmentsRes.data || []).filter((a: Appointment) => 
      !usedAppointmentIds.includes(a.id) && a.status !== 'cancelled'
    ));
    
    setLoading(false);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData(prev => ({ ...prev, email: lead.email }));
    
    // Try to match with assessment
    const matchingAssessment = assessments.find(a => a.email === lead.email);
    if (matchingAssessment) setSelectedAssessment(matchingAssessment);
    
    // Try to match with appointment
    const matchingAppointment = appointments.find(a => a.guest_email === lead.email);
    if (matchingAppointment) {
      setSelectedAppointment(matchingAppointment);
      setFormData(prev => ({ ...prev, name: matchingAppointment.guest_name }));
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    if (assessment.email) {
      setFormData(prev => ({ ...prev, email: prev.email || assessment.email! }));
    }
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData(prev => ({
      ...prev,
      name: prev.name || appointment.guest_name,
      email: prev.email || appointment.guest_email,
    }));
  };

  const handleProceed = () => {
    if (!selectedLead && !selectedAssessment && !selectedAppointment) {
      toast({ title: 'Please select at least one source', variant: 'destructive' });
      return;
    }
    setStep('details');
  };

  const handleConvert = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('clients').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        status: 'prospect',
        lead_id: selectedLead?.id || null,
        assessment_id: selectedAssessment?.id || null,
        initial_appointment_id: selectedAppointment?.id || null,
        start_month: formData.start_month ? formData.start_month + '-01' : null,
        total_contract_value: 0,
      });

      if (error) throw error;

      toast({ title: 'Lead converted to client!' });
      onConverted();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: 'Error converting lead', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead to Client</DialogTitle>
          <DialogDescription>
            {step === 'select' ? 'Select the source records to link to this client' : 'Complete the client details'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : step === 'select' ? (
          <div className="space-y-6 py-4">
            {/* Lead Submissions */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Lead Submission
              </Label>
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unconverted leads</p>
              ) : (
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {leads.map((lead) => (
                    <Card
                      key={lead.id}
                      className={`cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
                      onClick={() => handleSelectLead(lead)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(lead.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {selectedLead?.id === lead.id && <Check className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Assessments */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Assessment Response
              </Label>
              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unconverted assessments</p>
              ) : (
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {assessments.map((assessment) => (
                    <Card
                      key={assessment.id}
                      className={`cursor-pointer transition-colors ${selectedAssessment?.id === assessment.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
                      onClick={() => handleSelectAssessment(assessment)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{assessment.email || 'No email'}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {assessment.overall_score}% • {assessment.business_type || 'Unknown business'}
                          </p>
                        </div>
                        {selectedAssessment?.id === assessment.id && <Check className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Appointments */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointment
              </Label>
              {appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unconverted appointments</p>
              ) : (
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {appointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className={`cursor-pointer transition-colors ${selectedAppointment?.id === appointment.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
                      onClick={() => handleSelectAppointment(appointment)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{appointment.guest_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.guest_email} • {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {selectedAppointment?.id === appointment.id && <Check className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleProceed}>Continue</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Selected Sources Summary */}
            <div className="flex flex-wrap gap-2">
              {selectedLead && <Badge variant="secondary">Lead: {selectedLead.email}</Badge>}
              {selectedAssessment && <Badge variant="secondary">Assessment: Score {selectedAssessment.overall_score}%</Badge>}
              {selectedAppointment && <Badge variant="secondary">Appointment: {selectedAppointment.guest_name}</Badge>}
            </div>

            {/* Client Details Form */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="start_month">Start Month (for capacity tracking)</Label>
                <Input
                  id="start_month"
                  type="month"
                  value={formData.start_month}
                  onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
              <Button onClick={handleConvert} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Convert to Client
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
