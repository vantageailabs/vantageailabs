import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, GripVertical, Package } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  display_order: number;
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    base_price: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order');

    if (error) {
      toast({ title: 'Error loading services', description: error.message, variant: 'destructive' });
    } else {
      setServices((data as Service[]) || []);
    }
    setLoading(false);
  };

  const handleAddService = async () => {
    if (!newService.name) {
      toast({ title: 'Service name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('services').insert({
      name: newService.name,
      description: newService.description || null,
      base_price: newService.base_price,
      display_order: services.length,
    });

    if (error) {
      toast({ title: 'Error adding service', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Service added!' });
      setNewService({ name: '', description: '', base_price: 0 });
      fetchServices();
    }
    setSaving(false);
  };

  const handleToggleActive = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (error) {
      toast({ title: 'Error updating service', description: error.message, variant: 'destructive' });
    } else {
      fetchServices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? It may affect existing client records.')) return;

    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting service', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Service deleted' });
      fetchServices();
    }
  };

  const handleUpdateService = async (id: string, updates: Partial<Service>) => {
    const { error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating service', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Service */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g., AI Workflow Audit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Base Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={newService.base_price}
                onChange={(e) => setNewService({ ...newService, base_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
          </div>
          <Button onClick={handleAddService} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Service
          </Button>
        </CardContent>
      </Card>

      {/* Services List */}
      {services.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No services yet. Add your first service above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <Card key={service.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-muted-foreground cursor-move">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        className="font-semibold text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                        value={service.name}
                        onChange={(e) => {
                          setServices(services.map(s => s.id === service.id ? { ...s, name: e.target.value } : s));
                        }}
                        onBlur={(e) => handleUpdateService(service.id, { name: e.target.value })}
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={() => handleToggleActive(service)}
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Base Price: $</span>
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={service.base_price}
                          onChange={(e) => {
                            setServices(services.map(s => s.id === service.id ? { ...s, base_price: Number(e.target.value) } : s));
                          }}
                          onBlur={(e) => handleUpdateService(service.id, { base_price: Number(e.target.value) })}
                        />
                      </div>
                      <Input
                        className="flex-1 h-8 text-sm"
                        placeholder="Description..."
                        value={service.description || ''}
                        onChange={(e) => {
                          setServices(services.map(s => s.id === service.id ? { ...s, description: e.target.value } : s));
                        }}
                        onBlur={(e) => handleUpdateService(service.id, { description: e.target.value || null })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
