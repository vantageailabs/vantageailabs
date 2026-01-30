import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { trackPartialData, trackComplete } = useFormAnalytics({ 
    initialStep: 'lead_magnet' 
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.includes('@')) {
      trackPartialData('email', value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      // Save email to lead_submissions
      const { error: dbError } = await supabase
        .from('lead_submissions')
        .insert({
          email: email.trim(),
          source: 'lead_magnet'
        });

      if (dbError) throw dbError;
      
      // Send the playbook email
      const { error: emailError } = await supabase.functions.invoke('send-playbook-email', {
        body: { email: email.trim() }
      });

      if (emailError) {
        console.error('Error sending playbook email:', emailError);
        // Still show success since we saved their email
        toast.success("You're signed up! If you don't see the email, check spam.");
      } else {
        toast.success("Check your email for the AI Playbook!");
      }
      
      // Track completion
      await trackComplete();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "7 AI tools you can implement this week",
    "Real ROI calculations from actual clients",
    "Step-by-step implementation checklist",
    "Common mistakes to avoid",
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="card-elevated p-8 md:p-12 border-accent/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
                  <Download className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Free Resource</span>
                </div>
                
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
                  The Small Business <span className="text-gradient-accent">AI Playbook</span>
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  A practical guide to implementing AI in your business without the fluff, jargon, or $10k consulting fees.
                </p>

                <ul className="space-y-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="accent" 
                      size="lg" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Get Free Playbook"}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      No spam. Unsubscribe anytime. We respect your inbox.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-2">You're In!</h3>
                    <p className="text-muted-foreground text-sm">
                      Check your email for the AI Playbook. See you inside!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
