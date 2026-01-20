import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, Mail, Phone, DollarSign, Plus, Eye, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ClientDetailModal } from './ClientDetailModal';
import { ConvertLeadModal } from './ConvertLeadModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ClientStatus = 'lead' | 'prospect' | 'active' | 'completed' | 'churned';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: ClientStatus;
  lead_id: string | null;
  assessment_id: string | null;
  initial_appointment_id: string | null;
  support_package_id: string | null;
  start_month: string | null;
  total_contract_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  review_request_sent_at: string | null;
  referral_code: string | null;
}

const statusColors: Record<ClientStatus, string> = {
  lead: 'bg-muted text-muted-foreground',
  prospect: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-primary/20 text-primary',
  churned: 'bg-destructive/20 text-destructive',
};

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const { toast } = useToast();

  const fetchClients = async () => {
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as ClientStatus);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error loading clients', description: error.message, variant: 'destructive' });
    } else {
      setClients((data as Client[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const handleClientUpdated = () => {
    fetchClients();
    setSelectedClient(null);
  };

  const handleLeadConverted = () => {
    fetchClients();
    setShowConvertModal(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading clients...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">{clients.length} clients</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConvertModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convert Lead
          </Button>
          <Button onClick={() => setSelectedClient({} as Client)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No clients yet</p>
            <Button className="mt-4" onClick={() => setShowConvertModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Convert a Lead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedClient(client)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    {client.company && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[client.status]}>
                    {client.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    <DollarSign className="h-4 w-4" />
                    {client.total_contract_value.toLocaleString()}
                  </span>
                  {client.start_month && (
                    <span className="text-xs text-muted-foreground">
                      Start: {format(parseISO(client.start_month), 'MMM yyyy')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient.id ? selectedClient : null}
          open={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onSaved={handleClientUpdated}
        />
      )}

      <ConvertLeadModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConverted={handleLeadConverted}
      />
    </div>
  );
}
