import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Send } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  clientId: string;
  clientEmail: string;
  reviewRequestSentAt: string | null;
  onReviewSent: () => void;
}

export function ClientReviewSection({ clientId, clientEmail, reviewRequestSentAt, onReviewSent }: Props) {
  const [sendingReview, setSendingReview] = useState(false);
  const { toast } = useToast();

  const handleRequestReview = async () => {
    if (!clientEmail) {
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
          body: JSON.stringify({ client_id: clientId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send review request');
      }

      toast({ title: 'Review request sent!', description: `Email sent to ${clientEmail}` });
      onReviewSent();
    } catch (error: any) {
      toast({ title: 'Error sending review request', description: error.message, variant: 'destructive' });
    } finally {
      setSendingReview(false);
    }
  };

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Google Review</span>
          </div>
          {reviewRequestSentAt ? (
            <p className="text-xs text-muted-foreground">
              Last requested: {format(new Date(reviewRequestSentAt), 'MMM d, yyyy')}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No request sent yet</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestReview}
          disabled={sendingReview || !clientEmail}
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
  );
}
