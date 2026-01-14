import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Building2,
  DollarSign,
  Layers,
  Clock,
  Mail,
  Download,
  TrendingUp,
  Trash2,
  UserCheck
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface AppointmentInfo {
  id: string;
  status: string;
}

interface AssessmentResponse {
  id: string;
  created_at: string;
  email: string | null;
  appointment_id: string | null;
  overall_score: number;
  estimated_hours_saved: number;
  estimated_monthly_savings: number;
  answers: Record<string, string>;
  business_type: string | null;
  monthly_revenue: string | null;
  tool_stack: string | null;
  timeline: string | null;
  appointments?: AppointmentInfo | null;
}

const businessTypeLabels: Record<string, string> = {
  ecommerce: 'E-commerce/Retail',
  professional: 'Professional Services',
  saas: 'SaaS/Technology',
  local: 'Local Business',
  b2b: 'B2B Services',
};

const revenueLabels: Record<string, string> = {
  '50k_plus': '$50,000+/mo',
  '20k_50k': '$20K-$50K/mo',
  '10k_20k': '$10K-$20K/mo',
  '5k_10k': '$5K-$10K/mo',
  'under_5k': 'Under $5K/mo',
};

const toolStackLabels: Record<string, string> = {
  advanced: 'Advanced Stack',
  moderate: 'Moderate Stack',
  basic: 'Basic Stack',
  starting: 'Starting Stack',
  manual: 'Manual Operations',
};

const timelineLabels: Record<string, string> = {
  immediate: 'Immediate (1-2 weeks)',
  fast: 'Fast Track (3-4 weeks)',
  standard: 'Standard (1-2 months)',
  future: 'Future (3-6 months)',
  research: 'Researching',
};

export function AssessmentsList() {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [convertedAssessmentIds, setConvertedAssessmentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssessments = async () => {
    // Fetch assessments and clients in parallel
    const [assessmentsRes, clientsRes] = await Promise.all([
      supabase
        .from('assessment_responses')
        .select('*, appointments(id, status)')
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('assessment_id')
        .not('assessment_id', 'is', null)
    ]);

    if (assessmentsRes.error) {
      toast({ title: 'Error loading assessments', description: assessmentsRes.error.message, variant: 'destructive' });
    } else {
      setAssessments((assessmentsRes.data as AssessmentResponse[]) || []);
    }

    // Build set of converted assessment IDs
    if (clientsRes.data) {
      const convertedIds = new Set(
        clientsRes.data
          .map(c => c.assessment_id)
          .filter((id): id is string => id !== null)
      );
      setConvertedAssessmentIds(convertedIds);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const deleteAssessment = async (id: string) => {
    const { error } = await supabase
      .from('assessment_responses')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting assessment', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Assessment deleted' });
      fetchAssessments();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (score >= 40) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Potential';
    if (score >= 40) return 'Moderate Potential';
    return 'Low Potential';
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Email',
      'Score',
      'Hours Saved/Week',
      'Monthly Savings',
      'Business Type',
      'Revenue Range',
      'Tool Stack',
      'Timeline',
      'Has Appointment'
    ];

    const rows = assessments.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
      a.email || 'N/A',
      a.overall_score,
      a.estimated_hours_saved,
      a.estimated_monthly_savings,
      a.business_type ? businessTypeLabels[a.business_type] || a.business_type : 'N/A',
      a.monthly_revenue ? revenueLabels[a.monthly_revenue] || a.monthly_revenue : 'N/A',
      a.tool_stack ? toolStackLabels[a.tool_stack] || a.tool_stack : 'N/A',
      a.timeline ? timelineLabels[a.timeline] || a.timeline : 'N/A',
      a.appointment_id ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No assessments submitted yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {assessments.map((assessment) => (
        <Card key={assessment.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getScoreColor(assessment.overall_score)}>
                    {assessment.overall_score}/100 - {getScoreLabel(assessment.overall_score)}
                  </Badge>
                  {convertedAssessmentIds.has(assessment.id) ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Converted to Client
                    </Badge>
                  ) : assessment.appointment_id ? (
                    assessment.appointments?.status === 'cancelled' ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        <Calendar className="h-3 w-3 mr-1" />
                        Appointment Cancelled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        <Calendar className="h-3 w-3 mr-1" />
                        Has Appointment
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      No Appointment - Follow Up
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(assessment.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                  {assessment.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {assessment.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {assessment.estimated_hours_saved} hrs/week saved
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${assessment.estimated_monthly_savings.toLocaleString()}/mo savings
                  </span>
                </div>

                {/* Quick summary of business context */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {assessment.business_type && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Building2 className="h-3 w-3" />
                      {businessTypeLabels[assessment.business_type] || assessment.business_type}
                    </span>
                  )}
                  {assessment.monthly_revenue && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <DollarSign className="h-3 w-3" />
                      {revenueLabels[assessment.monthly_revenue] || assessment.monthly_revenue}
                    </span>
                  )}
                  {assessment.tool_stack && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Layers className="h-3 w-3" />
                      {toolStackLabels[assessment.tool_stack] || assessment.tool_stack}
                    </span>
                  )}
                  {assessment.timeline && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Clock className="h-3 w-3" />
                      {timelineLabels[assessment.timeline] || assessment.timeline}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === assessment.id ? null : assessment.id)}
                >
                  {expandedId === assessment.id ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Details
                    </>
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this assessment? This action cannot be undone.
                        {assessment.appointment_id && assessment.appointments?.status !== 'cancelled' && (
                          <span className="block mt-2 text-yellow-600">
                            Note: This assessment is linked to an active appointment. The appointment will remain but lose its assessment data.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAssessment(assessment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === assessment.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium mb-3 text-sm">Task Assessment Answers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(assessment.answers).map(([key, value]) => (
                    <div key={key} className="flex justify-between bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
