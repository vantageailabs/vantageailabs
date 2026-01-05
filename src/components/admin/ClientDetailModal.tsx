import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Client, ClientStatus } from './ClientsList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Service {
  id: string;
  name: string;
  base_price: number;
}

interface SupportPackage {
  id: string;
  name: string;
  monthly_price: number;
  hours_included: number;
}

type ServiceStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

interface ClientService {
  id: string;
  service_id: string;
  agreed_price: number;
  status: ServiceStatus;
  service?: Service;
}

interface ClientCost {
  id: string;
  name: string;
  amount: number;
  notes?: string;
  incurred_at: string;
}

interface Props {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ClientDetailModal({ client, open, onClose, onSaved }: Props) {
  const isNew = !client?.id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<SupportPackage[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [clientCosts, setClientCosts] = useState<ClientCost[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead' as ClientStatus,
    support_package_id: '',
    start_month: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchServicesAndPackages();
      if (client?.id) {
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          company: client.company || '',
          status: client.status,
          support_package_id: client.support_package_id || '',
          start_month: client.start_month || '',
          notes: client.notes || '',
        });
        fetchClientServices(client.id);
        fetchClientCosts(client.id);
      } else {
        resetForm();
      }
    }
  }, [open, client]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
      support_package_id: '',
      start_month: '',
      notes: '',
    });
    setClientServices([]);
    setClientCosts([]);
  };

  const fetchServicesAndPackages = async () => {
    const [servicesRes, packagesRes] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('support_packages').select('*').eq('is_active', true).order('display_order'),
    ]);

    if (servicesRes.data) setServices(servicesRes.data as Service[]);
    if (packagesRes.data) setPackages(packagesRes.data as SupportPackage[]);
  };

  const fetchClientServices = async (clientId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_services')
      .select('*, services(*)')
      .eq('client_id', clientId);

    if (data) {
      setClientServices(data.map((cs: any) => ({
        id: cs.id,
        service_id: cs.service_id,
        agreed_price: cs.agreed_price,
        status: cs.status,
        service: cs.services,
      })));
    }
    setLoading(false);
  };

  const fetchClientCosts = async (clientId: string) => {
    const { data } = await supabase
      .from('client_costs')
      .select('*')
      .eq('client_id', clientId)
      .order('incurred_at', { ascending: false });

    if (data) {
      setClientCosts(data as ClientCost[]);
    }
  };

  const calculateTotal = () => {
    const servicesTotal = clientServices.reduce((sum, cs) => sum + Number(cs.agreed_price), 0);
    const packagePrice = packages.find(p => p.id === formData.support_package_id)?.monthly_price || 0;
    return servicesTotal + Number(packagePrice);
  };

  const handleAddService = () => {
    if (services.length === 0) return;
    setClientServices([
      ...clientServices,
      {
        id: `temp-${Date.now()}`,
        service_id: services[0].id,
        agreed_price: services[0].base_price,
        status: 'planned' as ServiceStatus,
        service: services[0],
      },
    ]);
  };

  const handleAddCost = () => {
    setClientCosts([
      ...clientCosts,
      {
        id: `temp-${Date.now()}`,
        name: '',
        amount: 0,
        incurred_at: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveCost = (index: number) => {
    setClientCosts(clientCosts.filter((_, i) => i !== index));
  };

  const handleCostChange = (index: number, field: keyof ClientCost, value: string | number) => {
    const updated = [...clientCosts];
    updated[index] = { ...updated[index], [field]: value };
    setClientCosts(updated);
  };

  const calculateTotalCosts = () => {
    return clientCosts.reduce((sum, c) => sum + Number(c.amount), 0);
  };

  const handleRemoveService = (index: number) => {
    setClientServices(clientServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    const updated = [...clientServices];
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      updated[index] = {
        ...updated[index],
        service_id: value as string,
        agreed_price: service?.base_price || 0,
        service,
      };
    } else if (field === 'status') {
      updated[index] = { ...updated[index], status: value as ServiceStatus };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setClientServices(updated);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        status: formData.status,
        support_package_id: formData.support_package_id || null,
        start_month: formData.start_month || null,
        notes: formData.notes || null,
        total_contract_value: calculateTotal(),
      };

      let clientId = client?.id;

      if (isNew) {
        const { data, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();
        if (error) throw error;
        clientId = data.id;
      } else {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', clientId);
        if (error) throw error;

        // Delete existing services and re-insert
        await supabase.from('client_services').delete().eq('client_id', clientId);
      }

      // Insert client services
      if (clientServices.length > 0 && clientId) {
        const servicesToInsert = clientServices.map(cs => ({
          client_id: clientId,
          service_id: cs.service_id,
          agreed_price: cs.agreed_price,
          status: cs.status,
        }));

        const { error } = await supabase.from('client_services').insert(servicesToInsert);
        if (error) throw error;
      }

      // Save client costs
      if (clientId) {
        // Delete existing costs and re-insert
        await supabase.from('client_costs').delete().eq('client_id', clientId);

        if (clientCosts.length > 0) {
          const costsToInsert = clientCosts.map(c => ({
            client_id: clientId,
            name: c.name,
            amount: c.amount,
            notes: c.notes || null,
            incurred_at: c.incurred_at,
          }));

          const { error } = await supabase.from('client_costs').insert(costsToInsert);
          if (error) throw error;
        }
      }

      toast({ title: isNew ? 'Client created!' : 'Client updated!' });
      onSaved();
    } catch (error: any) {
      toast({ title: 'Error saving client', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Client' : `Edit: ${client?.name}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
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
          </div>

          {/* Status & Start Month */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ClientStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_month">Start Month (for capacity)</Label>
              <Input
                id="start_month"
                type="month"
                value={formData.start_month ? formData.start_month.slice(0, 7) : ''}
                onChange={(e) => setFormData({ ...formData, start_month: e.target.value + '-01' })}
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Assigned Services</Label>
              <Button variant="outline" size="sm" onClick={handleAddService} disabled={services.length === 0}>
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
            </div>

            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services available. Add services in the Services tab first.</p>
            ) : clientServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {clientServices.map((cs, index) => (
                  <div key={cs.id} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-muted/50">
                    <Select
                      value={cs.service_id}
                      onValueChange={(v) => handleServiceChange(index, 'service_id', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-28"
                      value={cs.agreed_price}
                      onChange={(e) => handleServiceChange(index, 'agreed_price', Number(e.target.value))}
                      placeholder="Price"
                    />
                    <Select
                      value={cs.status}
                      onValueChange={(v) => handleServiceChange(index, 'status', v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Package */}
          <div className="space-y-2">
            <Label>Support Package</Label>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No support packages available. Add packages in the Services tab first.</p>
            ) : (
              <Select
                value={formData.support_package_id || 'none'}
                onValueChange={(v) => setFormData({ ...formData, support_package_id: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a support package (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - ${p.monthly_price}/mo ({p.hours_included}hrs)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Costs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Costs</Label>
              <Button variant="outline" size="sm" onClick={handleAddCost}>
                <Plus className="h-4 w-4 mr-1" />
                Add Cost
              </Button>
            </div>

            {clientCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No costs tracked yet.</p>
            ) : (
              <div className="space-y-2">
                {clientCosts.map((cost, index) => (
                  <div key={cost.id} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-muted/50">
                    <Input
                      className="flex-1"
                      value={cost.name}
                      onChange={(e) => handleCostChange(index, 'name', e.target.value)}
                      placeholder="Cost name (e.g., Lovable credits)"
                    />
                    <Input
                      type="number"
                      className="w-28"
                      value={cost.amount}
                      onChange={(e) => handleCostChange(index, 'amount', Number(e.target.value))}
                      placeholder="Amount"
                    />
                    <Input
                      type="date"
                      className="w-36"
                      value={cost.incurred_at}
                      onChange={(e) => handleCostChange(index, 'incurred_at', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCost(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end text-sm text-muted-foreground">
                  Total Costs: <span className="font-medium text-destructive ml-1">${calculateTotalCosts().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <span className="font-medium">Total Contract Value</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal().toLocaleString()}</span>
            </div>
            {clientCosts.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="font-medium">Net Profit</span>
                <span className="text-xl font-bold text-foreground">
                  ${(calculateTotal() - calculateTotalCosts()).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isNew ? 'Create Client' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
