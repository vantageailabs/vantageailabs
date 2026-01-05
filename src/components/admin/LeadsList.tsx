import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Download, Users, ClipboardList, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { LeadDetailModal } from './LeadDetailModal';

interface Lead {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
  type: 'lead_magnet' | 'assessment';
  assessment_score?: number;
  answers?: Record<string, string>;
  estimated_hours_saved?: number;
  estimated_monthly_savings?: number;
  business_type?: string | null;
  monthly_revenue?: string | null;
  tool_stack?: string | null;
  timeline?: string | null;
}

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      // Fetch lead magnet submissions
      const { data: leadData, error: leadError } = await supabase
        .from('lead_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch assessment responses without appointments (email-only submissions)
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_responses')
        .select('*')
        .not('email', 'is', null)
        .is('appointment_id', null)
        .order('created_at', { ascending: false });

      if (leadError || assessmentError) {
        toast({ 
          title: 'Error loading leads', 
          description: leadError?.message || assessmentError?.message, 
          variant: 'destructive' 
        });
      } else {
        // Combine and format leads
        const formattedLeads: Lead[] = [
          ...(leadData || []).map(l => ({
            id: l.id,
            email: l.email,
            source: l.source,
            created_at: l.created_at,
            type: 'lead_magnet' as const,
          })),
          ...(assessmentData || []).map(a => ({
            id: a.id,
            email: a.email!,
            source: 'assessment',
            created_at: a.created_at,
            type: 'assessment' as const,
            assessment_score: a.overall_score,
            answers: a.answers as Record<string, string>,
            estimated_hours_saved: a.estimated_hours_saved,
            estimated_monthly_savings: a.estimated_monthly_savings,
            business_type: a.business_type,
            monthly_revenue: a.monthly_revenue,
            tool_stack: a.tool_stack,
            timeline: a.timeline,
          })),
        ];
        
        // Sort by created_at descending
        formattedLeads.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setLeads(formattedLeads);
      }
      setLoading(false);
    };

    fetchLeads();
  }, []);

  const exportLeads = () => {
    if (leads.length === 0) {
      toast({ title: 'No leads to export', variant: 'destructive' });
      return;
    }

    const csv = [
      ['Email', 'Source', 'Type', 'Score', 'Date'],
      ...leads.map((lead) => [
        lead.email,
        lead.source || '',
        lead.type,
        lead.assessment_score?.toString() || '',
        format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leads...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{leads.length} total leads</p>
        <Button variant="outline" onClick={exportLeads} disabled={leads.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {leads.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No leads yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Card 
              key={lead.id} 
              className="border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedLead(lead)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lead.type === 'assessment' ? (
                    <ClipboardList className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Mail className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{lead.email}</p>
                      {lead.type === 'assessment' && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10">
                          Assessment Only - Follow Up
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
                      {lead.assessment_score !== undefined && (
                        <span className="ml-2">• Score: {lead.assessment_score}%</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.source && (
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {lead.source}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LeadDetailModal
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        lead={selectedLead}
      />
    </div>
  );
}
