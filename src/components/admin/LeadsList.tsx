import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Download, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('lead_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error loading leads', description: error.message, variant: 'destructive' });
      } else {
        setLeads(data || []);
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
      ['Email', 'Source', 'Date'],
      ...leads.map((lead) => [
        lead.email,
        lead.source || '',
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
            <Card key={lead.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{lead.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {lead.source && (
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    {lead.source}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
