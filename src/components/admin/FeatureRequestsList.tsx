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
import { ChevronDown, ChevronUp, Building2, Mail, User, DollarSign, Trash2, ExternalLink } from 'lucide-react';

interface FeatureRequest {
  id: string;
  client_id: string | null;
  source_identifier: string;
  features: string[];
  status: string;
  quoted_amount: number | null;
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
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<FeatureRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRequest(id: string, updates: Partial<FeatureRequest>) {
    try {
      const { error } = await supabase
        .from('feature_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success('Request updated');
      setEditingRequest(null);
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
        filteredRequests.map((request) => (
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
                          {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[request.status] || ''}>
                        {request.status}
                      </Badge>
                      {request.quoted_amount && (
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
                  {/* Features */}
                  <div>
                    <Label className="text-sm font-medium">Requested Features</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

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
                      onClick={() => setEditingRequest(request)}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Update Quote
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
        ))
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRequest} onOpenChange={() => setEditingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Quote</DialogTitle>
            <DialogDescription>
              Set the quoted amount and add internal notes for this feature request.
            </DialogDescription>
          </DialogHeader>
          {editingRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quoted_amount">Quoted Amount ($)</Label>
                <Input
                  id="quoted_amount"
                  type="number"
                  placeholder="0.00"
                  defaultValue={editingRequest.quoted_amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || null;
                    setEditingRequest({ ...editingRequest, quoted_amount: value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes about this quote..."
                  defaultValue={editingRequest.notes || ''}
                  onChange={(e) => {
                    setEditingRequest({ ...editingRequest, notes: e.target.value });
                  }}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingRequest(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateRequest(editingRequest.id, {
                      quoted_amount: editingRequest.quoted_amount,
                      notes: editingRequest.notes,
                      status: editingRequest.quoted_amount ? 'quoted' : editingRequest.status
                    });
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
