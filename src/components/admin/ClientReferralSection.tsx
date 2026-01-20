import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift, Loader2, Plus, Check, UserPlus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Referral {
  id: string;
  referred_name: string | null;
  referred_email: string | null;
  status: string;
  reward_type: string | null;
  reward_claimed: boolean;
  created_at: string;
  converted_at: string | null;
}

interface Props {
  clientId: string;
  referralCode: string | null;
  onCodeGenerated: (code: string) => void;
}

const REWARD_TIERS = [
  { min: 1, max: 2, freeMonths: 1, discount: 20, label: '1 free month OR 20% off' },
  { min: 3, max: 4, freeMonths: 2, discount: 25, label: '2 free months OR 25% off' },
  { min: 5, max: Infinity, freeMonths: 3, discount: 30, label: '3 free months OR 30% off' },
];

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1 for clarity
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getRewardTier(referralCount: number) {
  return REWARD_TIERS.find(tier => referralCount >= tier.min && referralCount <= tier.max) || REWARD_TIERS[0];
}

export function ClientReferralSection({ clientId, referralCode, onCodeGenerated }: Props) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newReferral, setNewReferral] = useState({ name: '', email: '' });
  const [addingReferral, setAddingReferral] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      fetchReferrals();
    }
  }, [clientId]);

  const fetchReferrals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_client_id', clientId)
      .order('created_at', { ascending: false });

    if (data) {
      setReferrals(data as Referral[]);
    }
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    let code = generateReferralCode();
    
    // Check for uniqueness and retry if needed
    let attempts = 0;
    while (attempts < 5) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('referral_code', code)
        .maybeSingle();
      
      if (!data) break;
      code = generateReferralCode();
      attempts++;
    }

    const { error } = await supabase
      .from('clients')
      .update({ referral_code: code })
      .eq('id', clientId);

    if (error) {
      toast({ title: 'Error generating code', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Referral code generated!' });
      onCodeGenerated(code);
    }
    setGenerating(false);
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: 'Code copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddReferral = async () => {
    if (!newReferral.name || !newReferral.email) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }

    setAddingReferral(true);
    const { error } = await supabase.from('referrals').insert({
      referrer_client_id: clientId,
      referral_code_used: referralCode,
      referred_name: newReferral.name,
      referred_email: newReferral.email,
      status: 'pending',
    });

    if (error) {
      toast({ title: 'Error adding referral', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Referral logged!' });
      setNewReferral({ name: '', email: '' });
      setAddDialogOpen(false);
      fetchReferrals();
    }
    setAddingReferral(false);
  };

  const handleUpdateStatus = async (referralId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'converted') {
      updates.converted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('referrals')
      .update(updates)
      .eq('id', referralId);

    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    } else {
      fetchReferrals();
    }
  };

  const handleToggleRewardClaimed = async (referralId: string, currentClaimed: boolean) => {
    const { error } = await supabase
      .from('referrals')
      .update({ reward_claimed: !currentClaimed })
      .eq('id', referralId);

    if (error) {
      toast({ title: 'Error updating reward status', variant: 'destructive' });
    } else {
      fetchReferrals();
    }
  };

  const convertedCount = referrals.filter(r => r.status === 'converted').length;
  const currentTier = getRewardTier(convertedCount);
  const unclaimedRewards = referrals.filter(r => r.status === 'converted' && !r.reward_claimed).length;

  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <span className="font-medium">Referrals</span>
        </div>

        {/* Referral Code Section */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Referral Code</Label>
          {referralCode ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded bg-background border font-mono text-lg tracking-wider">
                {referralCode}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateCode} disabled={generating} variant="outline" className="w-full">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Referral Code
            </Button>
          )}
        </div>

        {/* Stats */}
        {referralCode && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">{convertedCount}</div>
              <div className="text-xs text-muted-foreground">Successful Referrals</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-amber-500">{unclaimedRewards}</div>
              <div className="text-xs text-muted-foreground">Unclaimed Rewards</div>
            </div>
          </div>
        )}

        {/* Current Reward Tier */}
        {convertedCount > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs text-muted-foreground mb-1">Current Reward Tier</div>
            <div className="font-medium text-amber-600">{currentTier.label}</div>
          </div>
        )}

        {/* Referral List */}
        {referralCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Referral History</Label>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Log Referral
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log New Referral</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Referred Person's Name</Label>
                      <Input
                        value={newReferral.name}
                        onChange={(e) => setNewReferral({ ...newReferral, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Referred Person's Email</Label>
                      <Input
                        type="email"
                        value={newReferral.email}
                        onChange={(e) => setNewReferral({ ...newReferral, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <Button onClick={handleAddReferral} disabled={addingReferral} className="w-full">
                      {addingReferral ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Log Referral
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No referrals logged yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{referral.referred_name}</div>
                      <div className="text-xs text-muted-foreground">{referral.referred_email}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(referral.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={referral.status}
                        onValueChange={(v) => handleUpdateStatus(referral.id, v)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="converted">
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Converted
                            </div>
                          </SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      {referral.status === 'converted' && (
                        <Button
                          variant={referral.reward_claimed ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleRewardClaimed(referral.id, referral.reward_claimed)}
                          className="h-8"
                        >
                          {referral.reward_claimed ? (
                            <Badge variant="secondary" className="text-xs">Claimed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Unclaimed</Badge>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
