import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Percent, DollarSign, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  created_at: string;
}

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading coupons', description: error.message, variant: 'destructive' });
    } else {
      setCoupons((data as Coupon[]) || []);
    }
    setLoading(false);
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.name) {
      toast({ title: 'Code and name are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      code: newCoupon.code.toUpperCase(),
      name: newCoupon.name,
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Coupon code already exists', variant: 'destructive' });
      } else {
        toast({ title: 'Error adding coupon', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Coupon created!' });
      setNewCoupon({ code: '', name: '', discount_type: 'percentage', discount_value: 10 });
      fetchCoupons();
    }
    setSaving(false);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast({ title: 'Error updating coupon', description: error.message, variant: 'destructive' });
    } else {
      fetchCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon? It may affect existing client services.')) return;

    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting coupon', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Coupon deleted' });
      fetchCoupons();
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`;
    }
    return `$${coupon.discount_value} off`;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Coupon */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Add New Coupon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-name">Name</Label>
              <Input
                id="coupon-name"
                value={newCoupon.name}
                onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                placeholder="e.g., New Client Discount"
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={newCoupon.discount_type}
                onValueChange={(v) => setNewCoupon({ ...newCoupon, discount_type: v as 'percentage' | 'fixed' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" /> Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-value">
                {newCoupon.discount_type === 'percentage' ? 'Percent Off' : 'Amount Off ($)'}
              </Label>
              <Input
                id="discount-value"
                type="number"
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={handleAddCoupon} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Coupon
          </Button>
        </CardContent>
      </Card>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No coupons yet. Create your first coupon above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="h-5 w-5 text-primary" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-lg">{coupon.code}</code>
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {formatDiscount(coupon)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{coupon.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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