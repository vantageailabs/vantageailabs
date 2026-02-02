import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Save } from 'lucide-react';
import { Client, ClientStatus } from './ClientsList';
import { Separator } from '@/components/ui/separator';
import { ClientCredentialsSection } from './ClientCredentialsSection';
import { ClientReferralSection } from './ClientReferralSection';
import { ClientProjectsSection, ClientProject } from './ClientProjectsSection';
import { ClientServicesSection, ClientService } from './ClientServicesSection';
import { ClientCostsSection, ClientCost } from './ClientCostsSection';
import { ClientReviewSection } from './ClientReviewSection';
import { ScopeCategory } from './ScopeCategoryBadge';
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
  max_projects: number | null;
  tier_type: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [clientCosts, setClientCosts] = useState<ClientCost[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
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
    referral_code: null as string | null,
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
          referral_code: client.referral_code || null,
        });
        fetchClientServices(client.id);
        fetchClientCosts(client.id);
        fetchClientProjects(client.id);
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
      referral_code: null,
    });
    setClientServices([]);
    setClientCosts([]);
    setClientProjects([]);
  };

  const fetchServicesAndPackages = async () => {
    const [servicesRes, packagesRes, couponsRes] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('support_packages').select('*').eq('is_active', true).order('display_order'),
      supabase.from('coupons').select('*').eq('is_active', true).order('code'),
    ]);

    if (servicesRes.data) setServices(servicesRes.data as Service[]);
    if (packagesRes.data) setPackages(packagesRes.data as SupportPackage[]);
    if (couponsRes.data) setCoupons(couponsRes.data as Coupon[]);
  };

  const fetchClientServices = async (clientId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('client_services')
      .select('*, services(*), coupons(*)')
      .eq('client_id', clientId);

    if (data) {
      type ClientServiceRow = {
        id: string;
        service_id: string;
        agreed_price: number;
        status: string;
        start_date: string | null;
        end_date: string | null;
        coupon_id: string | null;
        project_id: string | null;
        scope_category: string | null;
        services: { id: string; name: string; base_price: number } | null;
        coupons: { id: string; code: string; name: string; discount_type: 'percentage' | 'fixed'; discount_value: number } | null;
      };
      setClientServices(data.map((cs: ClientServiceRow) => ({
        id: cs.id,
        service_id: cs.service_id,
        agreed_price: cs.agreed_price,
        status: cs.status,
        start_date: cs.start_date,
        end_date: cs.end_date,
        coupon_id: cs.coupon_id,
        project_id: cs.project_id,
        scope_category: cs.scope_category || 'new_project',
        service: cs.services,
        coupon: cs.coupons,
      })));
    }
    setLoading(false);
  };

  const fetchClientProjects = async (clientId: string) => {
    const { data } = await supabase
      .from('client_projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (data) {
      setClientProjects(data as ClientProject[]);
    }
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

  const calculateDiscountedPrice = (cs: ClientService) => {
    if (!cs.coupon_id) return Number(cs.agreed_price);
    const coupon = coupons.find(c => c.id === cs.coupon_id) || cs.coupon;
    if (!coupon) return Number(cs.agreed_price);

    if (coupon.discount_type === 'percentage') {
      return Number(cs.agreed_price) * (1 - coupon.discount_value / 100);
    }
    return Math.max(0, Number(cs.agreed_price) - coupon.discount_value);
  };

  const calculateTotal = () => {
    const servicesTotal = clientServices.reduce((sum, cs) => {
      return sum + calculateDiscountedPrice(cs);
    }, 0);
    const packagePrice = packages.find(p => p.id === formData.support_package_id)?.monthly_price || 0;
    return servicesTotal + Number(packagePrice);
  };

  const calculateTotalCosts = () => {
    return clientCosts.reduce((sum, c) => sum + Number(c.amount), 0);
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

        await supabase.from('client_services').delete().eq('client_id', clientId);
        await supabase.from('client_projects').delete().eq('client_id', clientId);
      }

      // Insert client projects first (to get IDs for services)
      const projectIdMap = new Map<string, string>();
      if (clientProjects.length > 0 && clientId) {
        for (const project of clientProjects) {
          const { data, error } = await supabase
            .from('client_projects')
            .insert({
              client_id: clientId,
              name: project.name,
              domain: project.domain || null,
              status: project.status,
            })
            .select()
            .single();
          if (error) throw error;
          projectIdMap.set(project.id, data.id);
        }
      }

      // Insert client services with project references
      if (clientServices.length > 0 && clientId) {
        const servicesToInsert = clientServices.map(cs => ({
          client_id: clientId,
          service_id: cs.service_id,
          agreed_price: cs.agreed_price,
          status: cs.status,
          start_date: cs.start_date || null,
          end_date: cs.end_date || null,
          coupon_id: cs.coupon_id || null,
          project_id: cs.project_id ? (projectIdMap.get(cs.project_id) || cs.project_id) : null,
          scope_category: cs.scope_category,
        }));

        const { error } = await supabase.from('client_services').insert(servicesToInsert);
        if (error) throw error;
      }

      // Save client costs
      if (clientId) {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: 'Error saving client', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!client?.id) return;

    setSaving(true);
    try {
      await supabase.from('client_services').delete().eq('client_id', client.id);
      await supabase.from('client_costs').delete().eq('client_id', client.id);
      await supabase.from('client_projects').delete().eq('client_id', client.id);

      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;

      toast({ title: 'Client deleted' });
      onSaved();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: 'Error deleting client', description: message, variant: 'destructive' });
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

          {/* Projects Section */}
          <Separator />
          <ClientProjectsSection
            clientId={client?.id}
            isNewClient={isNew}
            projects={clientProjects}
            onProjectsChange={setClientProjects}
          />

          {/* Services */}
          <Separator />
          <ClientServicesSection
            services={services}
            coupons={coupons}
            clientServices={clientServices}
            clientProjects={clientProjects}
            onServicesChange={setClientServices}
          />

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
          <ClientCostsSection
            costs={clientCosts}
            onCostsChange={setClientCosts}
          />

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

          {/* Client Credentials Section */}
          {!isNew && client?.id && (
            <ClientCredentialsSection
              clientId={client.id}
              clientEmail={client.email}
              onRefresh={onSaved}
            />
          )}

          {/* Client Referral Section */}
          {!isNew && client?.id && (
            <ClientReferralSection
              clientId={client.id}
              clientName={formData.name || ''}
              clientEmail={formData.email || ''}
              referralCode={formData.referral_code}
              onCodeGenerated={(code) => setFormData({ ...formData, referral_code: code })}
            />
          )}

          {/* Google Review Request */}
          {!isNew && client?.id && (
            <ClientReviewSection
              clientId={client.id}
              clientEmail={client.email}
              reviewRequestSentAt={client.review_request_sent_at || null}
              onReviewSent={onSaved}
            />
          )}

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
          <div className="flex justify-between gap-2">
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Client
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this client? This will also remove all associated services and costs. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? 'Create Client' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
