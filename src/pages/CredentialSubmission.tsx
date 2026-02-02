import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

interface CredentialRequest {
  id: string;
  client_id: string;
  service_name: string;
  website_url: string | null;
  notes: string | null;
  status: string;
}

export default function CredentialSubmission() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [request, setRequest] = useState<CredentialRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    notes: '',
  });

  useEffect(() => {
    if (token) {
      fetchRequest();
    }
  }, [token]);

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('credential_requests')
        .select('*')
        .eq('request_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        setError('This credential request has expired or already been completed.');
        return;
      }

      setRequest(data as CredentialRequest);
    } catch (err) {
      setError('Failed to load credential request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (!request) return;

    setSubmitting(true);
    try {
      // Insert credentials
      const { error: insertError } = await supabase
        .from('client_credentials')
        .insert({
          request_id: request.id,
          client_id: request.client_id,
          service_name: request.service_name,
          website_url: request.website_url,
          username: formData.username,
          password: formData.password,
          notes: formData.notes || null,
        });

      if (insertError) throw insertError;

      // Update request status
      const { error: updateError } = await supabase
        .from('credential_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', request.id);

      if (updateError) throw updateError;

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast({ title: 'Error submitting credentials', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Credentials Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you! Your {request?.service_name} credentials have been securely stored. 
              We'll use them to complete the work on your project.
            </p>
            <p className="text-sm text-muted-foreground">
              You can safely close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Secure Credential Submission</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{request?.service_name}</CardTitle>
            </div>
            <CardDescription>
              Please enter your login credentials for {request?.service_name}. 
              This information will be encrypted and securely stored.
            </CardDescription>
            {request?.website_url && (
              <p className="text-sm text-muted-foreground mt-2">
                Website: <a href={request.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{request.website_url}</a>
              </p>
            )}
            {request?.notes && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>Note from Vantage AI Labs:</strong> {request.notes}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username or email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information we should know (e.g., 2FA setup, security questions)"
                  rows={3}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Submit Credentials Securely
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                🔒 Your credentials are transmitted over HTTPS and stored securely. 
                Only the Vantage AI Labs team can access them.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
