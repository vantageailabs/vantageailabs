import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, Send, Eye, EyeOff, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CredentialRequest {
  id: string;
  service_name: string;
  website_url: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface ClientCredential {
  id: string;
  service_name: string;
  website_url: string | null;
  username: string;
  password: string;
  notes: string | null;
  created_at: string;
}

interface Props {
  clientId: string;
  clientEmail: string;
  onRefresh?: () => void;
}

export function ClientCredentialsSection({ clientId, clientEmail, onRefresh }: Props) {
  const [credentials, setCredentials] = useState<ClientCredential[]>([]);
  const [requests, setRequests] = useState<CredentialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    service_name: '',
    website_url: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    setLoading(true);
    const [credRes, reqRes] = await Promise.all([
      supabase
        .from('client_credentials')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false }),
      supabase
        .from('credential_requests')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false }),
    ]);

    if (credRes.data) setCredentials(credRes.data as ClientCredential[]);
    if (reqRes.data) setRequests(reqRes.data as CredentialRequest[]);
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!newRequest.service_name) {
      toast({ title: 'Service name is required', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-credential-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            client_id: clientId,
            service_name: newRequest.service_name,
            website_url: newRequest.website_url || undefined,
            notes: newRequest.notes || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      toast({ title: 'Credential request sent!', description: `Email sent to ${clientEmail}` });
      setNewRequest({ service_name: '', website_url: '', notes: '' });
      setRequestDialogOpen(false);
      fetchData();
      onRefresh?.();
    } catch (error: any) {
      toast({ title: 'Error sending request', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Client Credentials</Label>
        </div>
        
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Request Credentials
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Client Credentials</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Service Name *</Label>
                <Input
                  id="service_name"
                  value={newRequest.service_name}
                  onChange={(e) => setNewRequest({ ...newRequest, service_name: e.target.value })}
                  placeholder="e.g., Squarespace, GoDaddy, Shopify"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL (optional)</Label>
                <Input
                  id="website_url"
                  value={newRequest.website_url}
                  onChange={(e) => setNewRequest({ ...newRequest, website_url: e.target.value })}
                  placeholder="e.g., https://squarespace.com/login"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Client (optional)</Label>
                <Textarea
                  id="notes"
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  placeholder="e.g., We need this to update your DNS records"
                  rows={2}
                />
              </div>
              <Button onClick={handleSendRequest} disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request Email
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Pending Requests:</p>
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{req.service_name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Sent {format(new Date(req.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stored Credentials */}
      {credentials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No credentials stored yet.</p>
      ) : (
        <div className="space-y-2">
          {credentials.map((cred) => (
            <div key={cred.id} className="p-3 rounded-lg border border-border bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{cred.service_name}</span>
                </div>
                {cred.website_url && (
                  <a
                    href={cred.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </a>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Username:</span>
                  <p className="font-mono text-xs bg-background p-1.5 rounded mt-1">{cred.username}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="font-mono text-xs bg-background p-1.5 rounded flex-1">
                      {showPasswords[cred.id] ? cred.password : '••••••••'}
                    </p>
                    <button
                      onClick={() => togglePassword(cred.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {showPasswords[cred.id] ? (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {cred.notes && (
                <p className="text-xs text-muted-foreground">
                  <strong>Notes:</strong> {cred.notes}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(cred.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
