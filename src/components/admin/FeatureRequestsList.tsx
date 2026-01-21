import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Building2, Mail, User, DollarSign, Trash2, ExternalLink, Percent, Tag } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
}

interface FeatureRequest {
  id: string;
  client_id: string | null;
  source_identifier: string;
  features: string[];
  status: string;
  quoted_amount: number | null;
  feature_quotes: Record<string, number> | null;
  coupon_id: string | null;
  applied_discount_percent: number | null;
  notes: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  submitter_notes: string | null;
  created_at: string;
  clients?: {
    id: string;
    name: string;
    company: string | null;
  } | null;
  coupons?: Coupon | null;
}

interface EditingState {
  request: FeatureRequest;
  featureQuotes: Record<string, number>;
  notes: string;
  couponId: string | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

export function FeatureRequestsList() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  }

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .select(`
          *,
          clients (
            id,
            name,
            company
          ),
          coupons (
            id,
            code,
            name,
            discount_type,
            discount_value
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure feature_quotes is properly typed
      const transformedData = (data || []).map(item => ({
        ...item,
        feature_quotes: (item.feature_quotes as Record<string, number>) || {}
      }));
      
      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  }

  // Get recommended coupon based on feature count
  function getRecommendedCoupon(featureCount: number): Coupon | null {
    if (featureCount >= 3) {
      return coupons.find(c => c.code === 'CUSTOMER20') || null;
    }
    if (featureCount === 1) {
      return coupons.find(c => c.code === 'CUSTOMER10') || null;
    }
    return null;
  }

  // Calculate totals
  function calculateTotals(featureQuotes: Record<string, number>, coupon: Coupon | null) {
    const subtotal = Object.values(featureQuotes).reduce((sum, price) => sum + (price || 0), 0);
    let discount = 0;
    
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
      } else {
        discount = coupon.discount_value;
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  }

  async function handleUpdateRequest(id: string, updates: Partial<FeatureRequest>) {
    try {
      const { error } = await supabase
        .from('feature_requests')
        .update(updates as Record<string, Json>)
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success('Request updated');
      setEditingState(null);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  }

  async function handleDeleteRequest(id: string) {
    if (!confirm('Are you sure you want to delete this feature request?')) return;

    try {
      const { error } = await supabase
        .from('feature_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.filter(r => r.id !== id));
      toast.success('Request deleted');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  }

  function openEditDialog(request: FeatureRequest) {
    const featureQuotes: Record<string, number> = {};
    request.features.forEach(feature => {
      featureQuotes[feature] = request.feature_quotes?.[feature] || 0;
    });
    
    // Auto-suggest coupon based on feature count
    const recommendedCoupon = getRecommendedCoupon(request.features.length);
    
    setEditingState({
      request,
      featureQuotes,
      notes: request.notes || '',
      couponId: request.coupon_id || recommendedCoupon?.id || null
    });
  }

  function handleFeatureQuoteChange(feature: string, value: number) {
    if (!editingState) return;
    setEditingState({
      ...editingState,
      featureQuotes: {
        ...editingState.featureQuotes,
        [feature]: value
      }
    });
  }

  function handleSaveQuote() {
    if (!editingState) return;
    
    const selectedCoupon = coupons.find(c => c.id === editingState.couponId);
    const { total } = calculateTotals(editingState.featureQuotes, selectedCoupon || null);
    
    handleUpdateRequest(editingState.request.id, {
      feature_quotes: editingState.featureQuotes,
      quoted_amount: total,
      coupon_id: editingState.couponId,
      applied_discount_percent: selectedCoupon?.discount_type === 'percentage' ? selectedCoupon.discount_value : 0,
      notes: editingState.notes,
      status: total > 0 ? 'quoted' : editingState.request.status
    });
  }

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-4">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get current editing totals
  const editingCoupon = editingState ? coupons.find(c => c.id === editingState.couponId) : null;
  const editingTotals = editingState ? calculateTotals(editingState.featureQuotes, editingCoupon || null) : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Label>Filter by status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No feature requests found.</p>
          </CardContent>
        </Card>
      ) : (
        filteredRequests.map((request) => {
          const requestCoupon = request.coupons;
          const hasQuotes = request.feature_quotes && Object.keys(request.feature_quotes).length > 0;
          
          return (
            <Collapsible
              key={request.id}
              open={expandedId === request.id}
              onOpenChange={(open) => setExpandedId(open ? request.id : null)}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-base">
                            {request.clients?.company || request.clients?.name || request.source_identifier}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')} • {request.features.length} feature{request.features.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[request.status] || ''}>
                          {request.status}
                        </Badge>
                        {request.applied_discount_percent && request.applied_discount_percent > 0 && (
                          <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">
                            <Percent className="h-3 w-3 mr-1" />
                            {request.applied_discount_percent}% off
                          </Badge>
                        )}
                        {request.quoted_amount !== null && request.quoted_amount > 0 && (
                          <Badge variant="outline">
                            ${request.quoted_amount.toLocaleString()}
                          </Badge>
                        )}
                        {expandedId === request.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-4 space-y-4">
                    {/* Features with individual quotes */}
                    <div>
                      <Label className="text-sm font-medium">Requested Features</Label>
                      <div className="mt-2 space-y-2">
                        {request.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <span className="text-sm">{feature}</span>
                            {hasQuotes && request.feature_quotes?.[feature] !== undefined && (
                              <Badge variant="secondary">
                                ${request.feature_quotes[feature].toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quote breakdown if available */}
                    {hasQuotes && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${Object.values(request.feature_quotes || {}).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                        </div>
                        {requestCoupon && (
                          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {requestCoupon.code} ({requestCoupon.discount_value}% off)
                            </span>
                            <span>
                              -${(Object.values(request.feature_quotes || {}).reduce((a, b) => a + b, 0) * (requestCoupon.discount_value / 100)).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Total</span>
                          <span>${request.quoted_amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Submitter info */}
                    {(request.submitter_name || request.submitter_email) && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {request.submitter_name && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {request.submitter_name}
                          </div>
                        )}
                        {request.submitter_email && (
                          <a
                            href={`mailto:${request.submitter_email}`}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            {request.submitter_email}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Submitter notes */}
                    {request.submitter_notes && (
                      <div>
                        <Label className="text-sm font-medium">Submitter Notes</Label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {request.submitter_notes}
                        </p>
                      </div>
                    )}

                    {/* Internal notes */}
                    {request.notes && (
                      <div>
                        <Label className="text-sm font-medium">Internal Notes</Label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(request)}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        {hasQuotes ? 'Edit Quote' : 'Create Quote'}
                      </Button>
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleUpdateRequest(request.id, { status: value })}
                      >
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-auto"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })
      )}

      {/* Edit Quote Dialog */}
      <Dialog open={!!editingState} onOpenChange={() => setEditingState(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Features</DialogTitle>
            <DialogDescription>
              Set individual prices for each feature. A coupon will be auto-suggested based on the number of features.
            </DialogDescription>
          </DialogHeader>
          {editingState && (
            <div className="space-y-4">
              {/* Per-feature pricing */}
              <div className="space-y-3">
                <Label>Feature Pricing</Label>
                {editingState.request.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex-1 text-sm truncate" title={feature}>
                      {feature}
                    </span>
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="0"
                        value={editingState.featureQuotes[feature] || ''}
                        onChange={(e) => handleFeatureQuoteChange(feature, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon selection */}
              <div className="space-y-2">
                <Label>Apply Coupon</Label>
                {getRecommendedCoupon(editingState.request.features.length) && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✨ Recommended: {getRecommendedCoupon(editingState.request.features.length)?.code} ({editingState.request.features.length >= 3 ? '3+ features' : '1 feature'} discount)
                  </p>
                )}
                <Select 
                  value={editingState.couponId || 'none'} 
                  onValueChange={(value) => setEditingState({
                    ...editingState,
                    couponId: value === 'none' ? null : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coupon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No coupon</SelectItem>
                    {coupons.map(coupon => (
                      <SelectItem key={coupon.id} value={coupon.id}>
                        {coupon.code} - {coupon.discount_value}% off
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quote summary */}
              {editingTotals && editingTotals.subtotal > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${editingTotals.subtotal.toLocaleString()}</span>
                  </div>
                  {editingCoupon && editingTotals.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>{editingCoupon.code} ({editingCoupon.discount_value}% off)</span>
                      <span>-${editingTotals.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${editingTotals.total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Internal notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes about this quote..."
                  value={editingState.notes}
                  onChange={(e) => setEditingState({ ...editingState, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingState(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveQuote}>
                  Save Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
