import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Video, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'calendar' | 'form' | 'success'>('calendar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ zoom_join_url: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const { toast } = useToast();
  const { availableSlots, isDateAvailable, formatTimeDisplay, loading, settings, blockedDates } = useAvailableSlots(selectedDate);

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

  const handleBooking = async () => {
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
      
      // Check for pending assessment from landing page
      const pendingAssessmentId = localStorage.getItem('pending_assessment_id');
      
      const { data, error } = await supabase.functions.invoke('create-appointment', {
        body: {
          appointment_date: dateStr,
          appointment_time: selectedTime,
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone || undefined,
          notes: formData.notes || undefined,
          assessment_id: pendingAssessmentId || undefined,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Clear the pending assessment ID after successful booking
      if (pendingAssessmentId) {
        localStorage.removeItem('pending_assessment_id');
      }

      setBookingResult(data.appointment);
      setStep('success');
      
      toast({
        title: "Booking confirmed!",
        description: "Check your email for the meeting details.",
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
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
          <p className="text-lg text-muted-foreground">
            {settings?.appointment_duration_minutes || 30} minutes. Zero pressure. We'll audit your current processes and show you exactly where AI can save you time and money.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card-elevated p-8">
            {step === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Booking Confirmed!</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a confirmation email with all the meeting details.
                </p>
                {bookingResult?.zoom_join_url && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => window.open(bookingResult.zoom_join_url, '_blank')}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Zoom Meeting
                  </Button>
                )}
              </div>
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
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime && formatTimeDisplay(selectedTime)}
                </p>

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
                    <label className="text-sm font-medium mb-1 block">Phone (optional)</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Anything we should know? (optional)</label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tell us about your business..."
                    />
                  </div>
                  
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mt-4"
                    onClick={handleBooking}
                    disabled={isSubmitting || !formData.name || !formData.email}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <Check className="w-5 h-5 ml-2" />
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
                      {availableSlots.length > 0 ? (
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
                          No available times for this date
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-6">
                      <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select a date to see available times
                      </p>
                    </div>
                  )}

                  {/* Call details */}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Video className="w-5 h-5 text-primary" />
                      <span>Video call via Zoom</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>{settings?.appointment_duration_minutes || 30} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
