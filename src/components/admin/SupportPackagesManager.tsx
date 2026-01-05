import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Headphones } from 'lucide-react';

interface SupportPackage {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  hours_included: number;
  is_active: boolean;
  display_order: number;
}

export function SupportPackagesManager() {
  const [packages, setPackages] = useState<SupportPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    monthly_price: 0,
    hours_included: 0,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('support_packages')
      .select('*')
      .order('display_order');

    if (error) {
      toast({ title: 'Error loading packages', description: error.message, variant: 'destructive' });
    } else {
      setPackages((data as SupportPackage[]) || []);
    }
    setLoading(false);
  };

  const handleAddPackage = async () => {
    if (!newPackage.name) {
      toast({ title: 'Package name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('support_packages').insert({
      name: newPackage.name,
      description: newPackage.description || null,
      monthly_price: newPackage.monthly_price,
      hours_included: newPackage.hours_included,
      display_order: packages.length,
    });

    if (error) {
      toast({ title: 'Error adding package', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Package added!' });
      setNewPackage({ name: '', description: '', monthly_price: 0, hours_included: 0 });
      fetchPackages();
    }
    setSaving(false);
  };

  const handleToggleActive = async (pkg: SupportPackage) => {
    const { error } = await supabase
      .from('support_packages')
      .update({ is_active: !pkg.is_active })
      .eq('id', pkg.id);

    if (error) {
      toast({ title: 'Error updating package', description: error.message, variant: 'destructive' });
    } else {
      fetchPackages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package? It may affect existing client records.')) return;

    const { error } = await supabase.from('support_packages').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting package', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Package deleted' });
      fetchPackages();
    }
  };

  const handleUpdatePackage = async (id: string, updates: Partial<SupportPackage>) => {
    const { error } = await supabase
      .from('support_packages')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating package', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Package */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Support Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="pkgName">Package Name</Label>
              <Input
                id="pkgName"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                placeholder="e.g., Basic Support"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkgPrice">Monthly Price ($)</Label>
              <Input
                id="pkgPrice"
                type="number"
                value={newPackage.monthly_price}
                onChange={(e) => setNewPackage({ ...newPackage, monthly_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkgHours">Hours Included</Label>
              <Input
                id="pkgHours"
                type="number"
                value={newPackage.hours_included}
                onChange={(e) => setNewPackage({ ...newPackage, hours_included: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkgDesc">Description</Label>
              <Input
                id="pkgDesc"
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
          </div>
          <Button onClick={handleAddPackage} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Package
          </Button>
        </CardContent>
      </Card>

      {/* Packages List */}
      {packages.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No support packages yet. Add your first package above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`border-border/50 ${!pkg.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    className="font-semibold text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    value={pkg.name}
                    onChange={(e) => {
                      setPackages(packages.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p));
                    }}
                    onBlur={(e) => handleUpdatePackage(pkg.id, { name: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => handleToggleActive(pkg)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Monthly Price</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">$</span>
                      <Input
                        type="number"
                        className="h-8"
                        value={pkg.monthly_price}
                        onChange={(e) => {
                          setPackages(packages.map(p => p.id === pkg.id ? { ...p, monthly_price: Number(e.target.value) } : p));
                        }}
                        onBlur={(e) => handleUpdatePackage(pkg.id, { monthly_price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Hours Included</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={pkg.hours_included}
                      onChange={(e) => {
                        setPackages(packages.map(p => p.id === pkg.id ? { ...p, hours_included: Number(e.target.value) } : p));
                      }}
                      onBlur={(e) => handleUpdatePackage(pkg.id, { hours_included: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <Input
                  className="h-8 text-sm"
                  placeholder="Description..."
                  value={pkg.description || ''}
                  onChange={(e) => {
                    setPackages(packages.map(p => p.id === pkg.id ? { ...p, description: e.target.value } : p));
                  }}
                  onBlur={(e) => handleUpdatePackage(pkg.id, { description: e.target.value || null })}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
