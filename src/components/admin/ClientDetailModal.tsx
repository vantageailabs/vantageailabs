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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, Star, Send, Calendar, Clock, Tag } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Client, ClientStatus } from './ClientsList';
import { Separator } from '@/components/ui/separator';
import { ClientCredentialsSection } from './ClientCredentialsSection';
import { ClientReferralSection } from './ClientReferralSection';
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

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

type ServiceStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

interface ClientService {
  id: string;
  service_id: string;
  agreed_price: number;
  status: ServiceStatus;
  start_date: string | null;
  end_date: string | null;
  coupon_id: string | null;
  service?: Service;
  coupon?: Coupon;
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
  const [sendingReview, setSendingReview] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<SupportPackage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
          referral_code: (client as any).referral_code || null,
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
      referral_code: null,
    });
    setClientServices([]);
    setClientCosts([]);
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
    const { data, error } = await supabase
      .from('client_services')
      .select('*, services(*), coupons(*)')
      .eq('client_id', clientId);

    if (data) {
      setClientServices(data.map((cs: any) => ({
        id: cs.id,
        service_id: cs.service_id,
        agreed_price: cs.agreed_price,
        status: cs.status,
        start_date: cs.start_date,
        end_date: cs.end_date,
        coupon_id: cs.coupon_id,
        service: cs.services,
        coupon: cs.coupons,
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
    const servicesTotal = clientServices.reduce((sum, cs) => {
      const discountedPrice = calculateDiscountedPrice(cs);
      return sum + discountedPrice;
    }, 0);
    const packagePrice = packages.find(p => p.id === formData.support_package_id)?.monthly_price || 0;
    return servicesTotal + Number(packagePrice);
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
        start_date: null,
        end_date: null,
        coupon_id: null,
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
          start_date: cs.start_date || null,
          end_date: cs.end_date || null,
          coupon_id: cs.coupon_id || null,
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

  const handleDelete = async () => {
    if (!client?.id) return;
    
    setSaving(true);
    try {
      // Delete related records first
      await supabase.from('client_services').delete().eq('client_id', client.id);
      await supabase.from('client_costs').delete().eq('client_id', client.id);
      
      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;

      toast({ title: 'Client deleted' });
      onSaved();
    } catch (error: any) {
      toast({ title: 'Error deleting client', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestReview = async () => {
    if (!client?.id || !client.email) {
      toast({ title: 'Client email is required', variant: 'destructive' });
      return;
    }

    setSendingReview(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-review-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ client_id: client.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send review request');
      }

      toast({ title: 'Review request sent!', description: `Email sent to ${client.email}` });
      onSaved(); // Refresh to show updated timestamp
    } catch (error: any) {
      toast({ title: 'Error sending review request', description: error.message, variant: 'destructive' });
    } finally {
      setSendingReview(false);
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
              <div className="space-y-3">
                {clientServices.map((cs, index) => {
                  const duration = cs.start_date && cs.end_date 
                    ? differenceInDays(parseISO(cs.end_date), parseISO(cs.start_date)) + 1
                    : null;
                  const discountedPrice = calculateDiscountedPrice(cs);
                  const hasDiscount = cs.coupon_id && discountedPrice !== Number(cs.agreed_price);
                  const activeCoupon = cs.coupon_id ? (coupons.find(c => c.id === cs.coupon_id) || cs.coupon) : null;
                  
                  return (
                    <div key={cs.id} className="p-3 rounded-lg border border-border/50 bg-muted/50 space-y-2">
                      {/* Row 1: Service, Price, Status, Delete */}
                      <div className="flex items-center gap-2">
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
                      
                      {/* Row 2: Dates and Duration */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                        <div className="flex items-center gap-1.5 flex-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="date"
                            className="h-8 text-sm"
                            value={cs.start_date || ''}
                            onChange={(e) => handleServiceChange(index, 'start_date', e.target.value || null)}
                            placeholder="Start"
                          />
                          <span className="text-muted-foreground text-sm">→</span>
                          <Input
                            type="date"
                            className="h-8 text-sm"
                            value={cs.end_date || ''}
                            onChange={(e) => handleServiceChange(index, 'end_date', e.target.value || null)}
                            placeholder="End"
                          />
                        </div>
                        {duration !== null && (
                          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            {duration} day{duration !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Row 3: Coupon and Final Price */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                        <div className="flex items-center gap-1.5 flex-1">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          <Select
                            value={cs.coupon_id || 'none'}
                            onValueChange={(v) => handleServiceChange(index, 'coupon_id', v === 'none' ? null : v)}
                          >
                            <SelectTrigger className="h-8 text-sm flex-1">
                              <SelectValue placeholder="No coupon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No coupon</SelectItem>
                              {coupons.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.code} - {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`} off
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {hasDiscount && activeCoupon && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm text-muted-foreground line-through">${Number(cs.agreed_price).toFixed(0)}</span>
                            <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                              ${discountedPrice.toFixed(0)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
          {!isNew && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Google Review</span>
                  </div>
                  {client?.review_request_sent_at ? (
                    <p className="text-xs text-muted-foreground">
                      Last requested: {format(new Date(client.review_request_sent_at), 'MMM d, yyyy')}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No request sent yet</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestReview}
                  disabled={sendingReview || !client?.email}
                  className="border-amber-500/50 hover:bg-amber-500/10"
                >
                  {sendingReview ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Request Review
                </Button>
              </div>
            </div>
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
