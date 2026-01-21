import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Send, CheckCircle, Building2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

interface MatchedClient {
  id: string;
  name: string;
  company: string | null;
}

export default function CurrentCustomerQuotes() {
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || '';
  const featuresParam = searchParams.get('features') || '';
  
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [matchedClient, setMatchedClient] = useState<MatchedClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });

  // Parse features from URL on mount
  useEffect(() => {
    if (featuresParam) {
      const parsedFeatures = featuresParam
        .split(',')
        .map(f => decodeURIComponent(f.trim()).replace(/\+/g, ' '))
        .filter(Boolean);
      setFeatures(parsedFeatures);
    }
  }, [featuresParam]);

  // Try to match client by source identifier
  useEffect(() => {
    async function matchClient() {
      if (!source) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to find client by company name matching source
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, company')
          .or(`company.ilike.%${source}%,name.ilike.%${source}%`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setMatchedClient(data);
        }
      } catch (error) {
        console.error('Error matching client:', error);
      } finally {
        setIsLoading(false);
      }
    }

    matchClient();
  }, [source]);

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (features.length === 0) {
      toast.error('Please add at least one feature request');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feature_requests')
        .insert({
          client_id: matchedClient?.id || null,
          source_identifier: source || 'direct',
          features,
          submitter_name: formData.name || null,
          submitter_email: formData.email || null,
          submitter_notes: formData.notes || null
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Feature request submitted successfully!');
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Request Received!
            </h2>
            <p className="text-muted-foreground mb-6">
              We've received your feature request and will review it shortly. Our team will reach out with a quote.
            </p>
            <Button asChild>
              <Link to="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to site
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Feature Request & Quote
          </h1>
          <p className="text-muted-foreground">
            Review the requested features below and submit for a quote from our team.
          </p>
        </div>

        {/* Client identification */}
        {isLoading ? (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
            </CardContent>
          </Card>
        ) : matchedClient ? (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{matchedClient.company || matchedClient.name}</p>
                  <p className="text-sm text-muted-foreground">Existing client request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : source ? (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{source}</p>
                  <p className="text-sm text-muted-foreground">Request source</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requested Features</CardTitle>
              <CardDescription>
                These features require a separate quote as they involve new functionality or integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feature list */}
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm py-1.5 px-3 flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {features.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No features added yet. Add features below.
                  </p>
                )}
              </div>

              {/* Add feature input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add another feature request..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Optional: Provide your details so we can send you the quote directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context or requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feature Request
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Our team typically responds within 1-2 business days with a detailed quote.
        </p>
      </main>
    </div>
  );
}
