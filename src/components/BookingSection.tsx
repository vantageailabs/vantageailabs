import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Video, ChevronLeft, ChevronRight, Check, Loader2, Zap, X } from "lucide-react";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarScarcity } from "@/components/CalendarScarcity";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import { calculateAssessmentResults, type AssessmentResults, type CategoryResult } from "@/lib/assessmentQuestions";
import { formatPhoneNumber } from "@/lib/formatPhone";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";

const BookingSection = () => {
  const navigate = useNavigate();
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
  
  // Check for existing assessment from standalone flow
  const [existingAssessmentId, setExistingAssessmentId] = useState<string | null>(null);
  
  // Check for BOS configuration from BOS Builder flow
  const [pendingBosConfig, setPendingBosConfig] = useState<{
    id: string;
    email: string;
    name: string;
    businessName: string;
    selectedModules: string[];
    totalPrice: number;
    totalHoursSaved: number;
    suggestedTier: string;
  } | null>(null);

  const { toast } = useToast();
  const { trackStep, trackFieldBlur, trackPartialData, trackAssessmentQuestion, trackComplete } = useFormAnalytics();
  
  // Helper to read and validate pending assessment from sessionStorage
  const readPendingAssessment = (): string | null => {
    try {
      const pendingData = sessionStorage.getItem('pending_assessment');
      if (pendingData) {
        const parsed = JSON.parse(pendingData);
        const TTL_MS = 30 * 60 * 1000; // 30 minutes
        const isExpired = Date.now() - parsed.createdAt > TTL_MS;
        
        if (isExpired) {
          sessionStorage.removeItem('pending_assessment');
          return null;
        }
        return parsed.id || null;
      }
    } catch (e) {
      sessionStorage.removeItem('pending_assessment');
    }
    return null;
  };
  
  // Check sessionStorage for pending assessment and BOS config on mount
  useEffect(() => {
    const pendingId = readPendingAssessment();
    if (pendingId) {
      setExistingAssessmentId(pendingId);
    }
    
    // Check for BOS config from BOS Builder
    try {
      const bosData = sessionStorage.getItem('pending_bos_config');
      if (bosData) {
        const parsed = JSON.parse(bosData);
        const TTL_MS = 30 * 60 * 1000; // 30 minutes
        const isExpired = Date.now() - parsed.createdAt > TTL_MS;
        
        if (isExpired) {
          sessionStorage.removeItem('pending_bos_config');
        } else {
          setPendingBosConfig(parsed);
          // Pre-fill form with BOS data
          setFormData(prev => ({
            ...prev,
            email: parsed.email || prev.email,
            name: parsed.name || prev.name,
            company: parsed.businessName || prev.company,
          }));
        }
      }
    } catch (e) {
      sessionStorage.removeItem('pending_bos_config');
    }
  }, []);
  
  const { availableSlots, isDateAvailable, formatTimeDisplay, loading, loadingSlots, settings } = useAvailableSlots(selectedDate);

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
      trackStep('form');
    }
  };

  const handleContinueToAssessment = () => {
    if (formData.name && formData.email && formData.company) {
      // Re-check sessionStorage in case user just clicked "Schedule Call" from standalone assessment
      const freshPendingId = readPendingAssessment();
      if (freshPendingId) {
        setExistingAssessmentId(freshPendingId);
        handleBookingWithExistingAssessment(freshPendingId);
      } else if (existingAssessmentId) {
        handleBookingWithExistingAssessment(existingAssessmentId);
      } else {
        setStep('assessment');
        trackStep('assessment');
      }
    }
  };

  // Handle booking when assessment was already completed in standalone flow
  const handleBookingWithExistingAssessment = async (assessmentId?: string) => {
    const idToUse = assessmentId || existingAssessmentId;
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
      
      const { data, error } = await supabase.functions.invoke('create-appointment', {
        body: {
          appointment_date: dateStr,
          appointment_time: selectedTime,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone || undefined,
          assessment_id: idToUse,
          bos_submission_id: pendingBosConfig?.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Clear the pending data from sessionStorage
      sessionStorage.removeItem('pending_assessment');
      sessionStorage.removeItem('pending_bos_config');
      setExistingAssessmentId(null);
      setPendingBosConfig(null);
      
      // Track completion
      trackComplete();

      // Redirect to confirmation page
      const meetUrl = data.appointment?.meeting_join_url ? encodeURIComponent(data.appointment.meeting_join_url) : '';
      navigate(`/booking-confirmed?date=${dateStr}&time=${selectedTime}${meetUrl ? `&meet=${meetUrl}` : ''}`);
      
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

  // Handle assessment completion in booking flow
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
      
      // Then create the appointment with the assessment linked
      const { data, error } = await supabase.functions.invoke('create-appointment', {
        body: {
          appointment_date: dateStr,
          appointment_time: selectedTime,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone || undefined,
          notes: additionalNotes || undefined,
          assessment_id: assessmentData?.id,
          bos_submission_id: pendingBosConfig?.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Clear any pending data from sessionStorage
      sessionStorage.removeItem('pending_assessment');
      sessionStorage.removeItem('pending_bos_config');
      setPendingBosConfig(null);
      
      // Track completion
      trackComplete();
      
      // Redirect to confirmation page
      const meetUrl = data.appointment?.meeting_join_url ? encodeURIComponent(data.appointment.meeting_join_url) : '';
      navigate(`/booking-confirmed?date=${dateStr}&time=${selectedTime}${meetUrl ? `&meet=${meetUrl}` : ''}`);
      
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

  const checkDayAvailability = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isDateAvailable(date);
  };

  if (loading) {
    return (
      <section id="booking" className="py-20 md:py-32 bg-background relative">
        <div className="container px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 md:py-32 bg-background relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            Ready to Scale?
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Book Your <span className="text-gradient-primary">Free Strategy Call</span>
          </h2>
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
                onQuestionChange={trackAssessmentQuestion}
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

                {pendingBosConfig && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Your BOS Configuration</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.removeItem('pending_bos_config');
                          setPendingBosConfig(null);
                        }}
                        className="text-primary/60 hover:text-primary transition-colors"
                        aria-label="Remove BOS configuration"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{pendingBosConfig.suggestedTier}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">${pendingBosConfig.totalPrice.toLocaleString()}</span>
                        <span className="text-primary">{pendingBosConfig.totalHoursSaved} hrs/week saved</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll discuss this configuration during your call.
                    </p>
                  </div>
                )}

                {existingAssessmentId && (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Assessment already completed</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sessionStorage.removeItem('pending_assessment');
                        setExistingAssessmentId(null);
                      }}
                      className="text-xs underline hover:no-underline opacity-80 hover:opacity-100"
                    >
                      Start over
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        trackPartialData('name', e.target.value);
                      }}
                      onBlur={() => trackFieldBlur('name', !!formData.name)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        trackPartialData('email', e.target.value);
                      }}
                      onBlur={() => trackFieldBlur('email', !!formData.email)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company *</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      onBlur={() => trackFieldBlur('company', !!formData.company)}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone (optional)</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      onBlur={() => trackFieldBlur('phone', !!formData.phone)}
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
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Booking...
                      </>
                    ) : existingAssessmentId ? (
                      <>
                        Confirm Booking
                        <Check className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue to Assessment
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
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
                            ${available 
                              ? selected 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-muted'
                              : 'text-muted-foreground/30 cursor-not-allowed'
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots & details */}
                <div>
                  {selectedDate ? (
                    <>
                      <h3 className="font-display font-semibold mb-4">
                        Available times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h3>
                      {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mb-2" />
                          <span className="text-sm">Fetching available time slots...</span>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-6 max-h-64 overflow-y-auto">
                            {availableSlots.map(time => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`
                                  p-3 rounded-lg text-sm font-medium transition-all border
                                  ${selectedTime === time
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
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
                              className="w-full"
                              onClick={handleContinueToForm}
                            >
                              Continue
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No available times for this date. Please select another date.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        Select a date to see available times
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Meeting Info */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{settings?.appointment_duration_minutes || 30} min meeting</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Google Meet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
