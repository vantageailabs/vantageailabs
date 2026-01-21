import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Headphones, FolderOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SupportPackage {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  hours_included: number;
  is_active: boolean;
  display_order: number;
  max_projects: number | null;
  tier_type: string;
}

const tierTypes = [
  { value: 'single', label: 'Single Project', description: 'Covers 1 project' },
  { value: 'portfolio', label: 'Portfolio', description: 'Covers 2-3 projects' },
  { value: 'unlimited', label: 'Unlimited', description: 'Covers all projects' },
];

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
    max_projects: 1,
    tier_type: 'single',
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
      max_projects: newPackage.tier_type === 'unlimited' ? null : newPackage.max_projects,
      tier_type: newPackage.tier_type,
      display_order: packages.length,
    });

    if (error) {
      toast({ title: 'Error adding package', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Package added!' });
      setNewPackage({ name: '', description: '', monthly_price: 0, hours_included: 0, max_projects: 1, tier_type: 'single' });
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

  const getTierBadge = (tierType: string, maxProjects: number | null) => {
    switch (tierType) {
      case 'single':
        return <Badge variant="secondary" className="gap-1"><FolderOpen className="h-3 w-3" /> 1 Project</Badge>;
      case 'portfolio':
        return <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20"><FolderOpen className="h-3 w-3" /> {maxProjects || '2-3'} Projects</Badge>;
      case 'unlimited':
        return <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20"><FolderOpen className="h-3 w-3" /> Unlimited</Badge>;
      default:
        return null;
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pkgName">Package Name</Label>
              <Input
                id="pkgName"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                placeholder="e.g., Single Project Support"
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Tier Type</Label>
              <Select
                value={newPackage.tier_type}
                onValueChange={(v) => setNewPackage({ ...newPackage, tier_type: v, max_projects: v === 'unlimited' ? null : (v === 'portfolio' ? 3 : 1) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tierTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newPackage.tier_type !== 'unlimited' && (
              <div className="space-y-2">
                <Label htmlFor="pkgMaxProjects">Max Projects</Label>
                <Input
                  id="pkgMaxProjects"
                  type="number"
                  min={1}
                  value={newPackage.max_projects || 1}
                  onChange={(e) => setNewPackage({ ...newPackage, max_projects: Number(e.target.value) })}
                />
              </div>
            )}
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

                {getTierBadge(pkg.tier_type, pkg.max_projects)}

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

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tier Type</Label>
                    <Select
                      value={pkg.tier_type}
                      onValueChange={(v) => {
                        setPackages(packages.map(p => p.id === pkg.id ? { ...p, tier_type: v } : p));
                        handleUpdatePackage(pkg.id, { tier_type: v, max_projects: v === 'unlimited' ? null : pkg.max_projects });
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tierTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {pkg.tier_type !== 'unlimited' && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Max Projects</Label>
                      <Input
                        type="number"
                        className="h-8"
                        min={1}
                        value={pkg.max_projects || 1}
                        onChange={(e) => {
                          setPackages(packages.map(p => p.id === pkg.id ? { ...p, max_projects: Number(e.target.value) } : p));
                        }}
                        onBlur={(e) => handleUpdatePackage(pkg.id, { max_projects: Number(e.target.value) })}
                      />
                    </div>
                  )}
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
