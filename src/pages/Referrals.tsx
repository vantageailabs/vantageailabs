import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Loader2, Check, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { CalendarScarcity } from "@/components/CalendarScarcity";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import { calculateAssessmentResults, type AssessmentResults, type CategoryResult } from "@/lib/assessmentQuestions";
import { formatPhoneNumber } from "@/lib/formatPhone";
import vantageIcon from "@/assets/vantage-icon.png";

interface ReferrerInfo {
  id: string;
  name: string;
  company: string | null;
}

const Referrals = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const refCode = searchParams.get('ref');
  
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [loadingReferrer, setLoadingReferrer] = useState(true);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'calendar' | 'form' | 'assessment'>('calendar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });

  const { availableSlots, isDateAvailable, formatTimeDisplay, loading, loadingSlots, settings } = useAvailableSlots(selectedDate);

  // Look up the referrer by code
  useEffect(() => {
    const lookupReferrer = async () => {
      if (!refCode) {
        setLoadingReferrer(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, company')
          .eq('referral_code', refCode)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setReferrer(data);
        }
      } catch (error) {
        console.error('Error looking up referrer:', error);
      } finally {
        setLoadingReferrer(false);
      }
    };

    lookupReferrer();
  }, [refCode]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    setSelectedDay(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDaySelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateAvailable(date)) {
      setSelectedDay(day);
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinueToForm = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const handleContinueToAssessment = () => {
    if (formData.name && formData.email && formData.company) {
      setStep('assessment');
    }
  };

  const checkDayAvailability = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isDateAvailable(date);
  };

  // Handle assessment completion and booking
  const handleAssessmentComplete = async (
    results: AssessmentResults & { categories: CategoryResult[] },
    answers: Record<string, string>,
    additionalNotes?: string
  ) => {
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // First, save the assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("assessment_responses")
        .insert({
          overall_score: results.overallScore,
          estimated_hours_saved: results.estimatedHoursSaved,
          estimated_monthly_savings: results.estimatedMonthlySavings,
          answers: { ...answers, additional_notes: additionalNotes },
          business_type: results.businessType,
          monthly_revenue: results.monthlyRevenue,
          tool_stack: results.toolStack,
          timeline: results.timeline,
          email: formData.email,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;
      
      // Create the appointment
      const { data, error } = await supabase.functions.invoke('create-appointment', {
        body: {
          appointment_date: dateStr,
          appointment_time: selectedTime,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone || undefined,
          notes: additionalNotes || undefined,
          assessment_id: assessmentData?.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Log the referral if we have a valid referrer
      if (referrer && refCode) {
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_client_id: referrer.id,
            referral_code_used: refCode,
            referred_name: formData.name,
            referred_email: formData.email,
            status: 'pending',
          });

        if (referralError) {
          console.error('Error logging referral:', referralError);
          // Don't fail the booking if referral logging fails
        }
      }

      // Redirect to confirmation page with referral info
      const meetUrl = data.appointment?.meeting_join_url ? encodeURIComponent(data.appointment.meeting_join_url) : '';
      const referralParam = referrer ? '&referral=true' : '';
      navigate(`/booking-confirmed?date=${dateStr}&time=${selectedTime}${meetUrl ? `&meet=${meetUrl}` : ''}${referralParam}`);
      
      toast({
        title: "Booking confirmed!",
        description: "Check your email for the meeting details.",
      });
    } catch (error: unknown) {
      console.error('Booking error:', error);
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: "Booking failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const referrerDisplayName = referrer 
    ? referrer.company 
      ? `${referrer.name} from ${referrer.company}`
      : referrer.name
    : null;

  if (loading || loadingReferrer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Referral Program"
        description="Refer a business to Vantage AI Labs and earn rewards. Help other Albuquerque businesses discover AI automation while earning bonuses."
        canonical="/referrals"
      />
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={vantageIcon} alt="Vantage AI Labs" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">Vantage AI Labs</span>
          </Link>
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <div className="container px-4">
          {/* Referral Banner */}
          {referrer && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="w-6 h-6 text-green-500" />
                  <span className="text-green-600 font-semibold text-lg">Referral Discount Applied!</span>
                </div>
                <p className="text-foreground">
                  You've been referred by <strong>{referrerDisplayName}</strong>! 🎉
                </p>
                <p className="text-muted-foreground mt-1">
                  You're eligible for <span className="text-green-600 font-bold">20% off</span> your first service with code <code className="bg-green-500/20 px-2 py-0.5 rounded font-mono text-green-600">REFERRAL20</code>
                </p>
              </div>
            </div>
          )}

          {/* No referrer but has code */}
          {!referrer && refCode && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="w-6 h-6 text-primary" />
                  <span className="text-primary font-semibold text-lg">Welcome!</span>
                </div>
                <p className="text-muted-foreground">
                  You were referred by a friend! Schedule your free strategy call below.
                </p>
              </div>
            </div>
          )}

          {/* Booking Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
              Ready to Scale?
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Book Your <span className="text-gradient-primary">Free Strategy Call</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {settings?.appointment_duration_minutes || 30} minutes. Zero pressure. We'll audit your current processes and show you exactly where AI can save you time and money.
            </p>
            <CalendarScarcity />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card-elevated p-8">
              {step === 'assessment' ? (
                <AssessmentFlow
                  mode="booking"
                  onComplete={handleAssessmentComplete}
                  onBack={() => setStep('form')}
                  isSubmitting={isSubmitting}
                />
              ) : step === 'form' ? (
                <div className="max-w-md mx-auto">
                  <button
                    onClick={() => setStep('calendar')}
                    className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to calendar
                  </button>
                  
                  <h3 className="font-display text-xl font-semibold mb-2">Your Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime && formatTimeDisplay(selectedTime)}
                  </p>

                  {referrer && (
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-3 rounded-lg mb-6">
                      <Gift className="w-5 h-5" />
                      <span className="text-sm font-medium">20% off your first service via referral!</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Company *</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone (optional)</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full mt-4"
                      onClick={handleContinueToAssessment}
                      disabled={!formData.name || !formData.email || !formData.company || isSubmitting}
                    >
                      Continue to Assessment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-semibold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigateMonth('prev')}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => navigateMonth('next')}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const available = checkDayAvailability(day);
                        const selected = selectedDay === day;
                        
                        return (
                          <button
                            key={day}
                            onClick={() => handleDaySelect(day)}
                            disabled={!available}
                            className={`
                              aspect-square rounded-lg text-sm font-medium transition-all
                              ${selected 
                                ? 'bg-primary text-primary-foreground' 
                                : available 
                                  ? 'hover:bg-primary/10 text-foreground' 
                                  : 'text-muted-foreground/40 cursor-not-allowed'
                              }
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-display font-semibold mb-6">
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        : 'Select a date'
                      }
                    </h3>
                    
                    {selectedDate ? (
                      loadingSlots ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                            {availableSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`
                                  py-3 px-4 rounded-lg text-sm font-medium transition-all
                                  ${selectedTime === time
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-primary/10'
                                  }
                                `}
                              >
                                {formatTimeDisplay(time)}
                              </button>
                            ))}
                          </div>
                          
                          {selectedTime && (
                            <Button
                              variant="hero"
                              size="lg"
                              className="w-full mt-6"
                              onClick={handleContinueToForm}
                            >
                              Continue
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No available times for this date.
                        </p>
                      )
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Select a date to see available times</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Meeting Details */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{settings?.appointment_duration_minutes || 30} minute call</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Google Meet</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vantage AI Labs. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Referrals;
