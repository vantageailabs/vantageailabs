import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Video, ChevronLeft, ChevronRight, Check, Loader2, Mail, Database, BarChart3, Headphones, UserCheck, Receipt, Share2, Building2, DollarSign, Layers, Clock as ClockIcon, MessageSquare } from "lucide-react";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarScarcity } from "@/components/CalendarScarcity";

interface Question {
  id: string;
  category: string;
  icon: React.ReactNode;
  question: string;
  options: { value: string; label: string; score: number }[];
  weight: number;
}

const assessmentQuestions: Question[] = [
  {
    id: "email",
    category: "Email & Communication",
    icon: <Mail className="h-5 w-5" />,
    question: "How many hours per week does your team spend on customer emails, follow-ups, and newsletters?",
    options: [
      { value: "heavy", label: "Heavy Load (15+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (8-12 hours/week)", score: 75 },
      { value: "light", label: "Light (4-7 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (2-3 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.2,
  },
  {
    id: "dataEntry",
    category: "Data Entry & Documentation",
    icon: <Database className="h-5 w-5" />,
    question: "How much time is spent manually entering data into spreadsheets, CRMs, or databases?",
    options: [
      { value: "heavy", label: "Heavy Load (10+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hours/week)", score: 75 },
      { value: "light", label: "Light (2-5 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.1,
  },
  {
    id: "scheduling",
    category: "Scheduling & Calendar",
    icon: <Calendar className="h-5 w-5" />,
    question: "How many hours are spent coordinating meetings, appointments, and rescheduling?",
    options: [
      { value: "heavy", label: "Heavy Load (8+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (4-8 hours/week)", score: 75 },
      { value: "light", label: "Light (2-4 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.0,
  },
  {
    id: "reporting",
    category: "Report Generation",
    icon: <BarChart3 className="h-5 w-5" />,
    question: "How much time is spent creating reports, dashboards, and performance summaries?",
    options: [
      { value: "heavy", label: "Heavy Load (10+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hours/week)", score: 75 },
      { value: "light", label: "Light (2-5 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.9,
  },
  {
    id: "support",
    category: "Customer Support",
    icon: <Headphones className="h-5 w-5" />,
    question: "How many hours are spent answering repetitive questions and handling support tickets?",
    options: [
      { value: "heavy", label: "Heavy Load (15+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (8-15 hours/week)", score: 75 },
      { value: "light", label: "Light (4-8 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 4 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.15,
  },
  {
    id: "leadFollowup",
    category: "Lead Follow-up",
    icon: <UserCheck className="h-5 w-5" />,
    question: "How much time is spent on lead qualification, initial outreach, and nurturing?",
    options: [
      { value: "heavy", label: "Heavy Load (10+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hours/week)", score: 75 },
      { value: "light", label: "Light (2-5 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.1,
  },
  {
    id: "invoicing",
    category: "Invoice & Payments",
    icon: <Receipt className="h-5 w-5" />,
    question: "How many hours are spent on billing, payment reminders, and reconciliation?",
    options: [
      { value: "heavy", label: "Heavy Load (8+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (4-8 hours/week)", score: 75 },
      { value: "light", label: "Light (2-4 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.85,
  },
  {
    id: "socialMedia",
    category: "Social Media & Content",
    icon: <Share2 className="h-5 w-5" />,
    question: "How much time is spent on posting, engagement, and content scheduling?",
    options: [
      { value: "heavy", label: "Heavy Load (10+ hours/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hours/week)", score: 75 },
      { value: "light", label: "Light (2-5 hours/week)", score: 50 },
      { value: "minimal", label: "Minimal (under 2 hours/week)", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.8,
  },
  {
    id: "businessType",
    category: "Business Profile",
    icon: <Building2 className="h-5 w-5" />,
    question: "What type of business do you operate?",
    options: [
      { value: "ecommerce", label: "E-commerce/Retail", score: 0 },
      { value: "professional", label: "Professional Services", score: 0 },
      { value: "saas", label: "SaaS/Technology", score: 0 },
      { value: "local", label: "Local Business", score: 0 },
      { value: "b2b", label: "B2B Services", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "monthlyRevenue",
    category: "Revenue Range",
    icon: <DollarSign className="h-5 w-5" />,
    question: "What is your current monthly revenue range?",
    options: [
      { value: "50k_plus", label: "$50,000+ monthly", score: 0 },
      { value: "20k_50k", label: "$20,000-$49,999 monthly", score: 0 },
      { value: "10k_20k", label: "$10,000-$19,999 monthly", score: 0 },
      { value: "5k_10k", label: "$5,000-$9,999 monthly", score: 0 },
      { value: "under_5k", label: "Under $5,000 monthly", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "toolStack",
    category: "Current Tool Stack",
    icon: <Layers className="h-5 w-5" />,
    question: "What does your current technology stack look like?",
    options: [
      { value: "advanced", label: "Advanced Stack - CRM, marketing automation, analytics", score: 0 },
      { value: "moderate", label: "Moderate Stack - Email platform, basic CRM, accounting", score: 0 },
      { value: "basic", label: "Basic Stack - Email, spreadsheets, basic website", score: 0 },
      { value: "starting", label: "Starting Stack - Gmail, social media, basic website", score: 0 },
      { value: "manual", label: "Manual Operations - Minimal software usage", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "timeline",
    category: "Investment Timeline",
    icon: <ClockIcon className="h-5 w-5" />,
    question: "When would you like to implement automation?",
    options: [
      { value: "immediate", label: "Immediate - Ready to start within 1-2 weeks", score: 0 },
      { value: "fast", label: "Fast Track - Want to begin within 3-4 weeks", score: 0 },
      { value: "standard", label: "Standard Timeline - Ready within 1-2 months", score: 0 },
      { value: "future", label: "Future Planning - Interested in 3-6 months", score: 0 },
      { value: "research", label: "Information Gathering - Timeline flexible", score: 0 },
    ],
    weight: 0,
  },
];

const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'calendar' | 'form' | 'assessment' | 'success'>('calendar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ meeting_join_url: string } | null>(null);
  
  // Assessment state
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });
  
  // Check for existing assessment from standalone flow
  const [existingAssessmentId, setExistingAssessmentId] = useState<string | null>(null);

  const { toast } = useToast();
  
  // Check localStorage for pending assessment on mount
  useEffect(() => {
    const pendingId = localStorage.getItem('pending_assessment_id');
    if (pendingId) {
      setExistingAssessmentId(pendingId);
    }
  }, []);
  const { availableSlots, isDateAvailable, formatTimeDisplay, loading, settings } = useAvailableSlots(selectedDate);

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
      // If user already completed standalone assessment, skip to booking
      if (existingAssessmentId) {
        handleBookingWithExistingAssessment();
      } else {
        setStep('assessment');
        setAssessmentStep(0);
      }
    }
  };

  // Handle booking when assessment was already completed in standalone flow
  const handleBookingWithExistingAssessment = async () => {
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
          assessment_id: existingAssessmentId,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Clear the pending assessment from localStorage
      localStorage.removeItem('pending_assessment_id');
      setExistingAssessmentId(null);

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

  const handleAssessmentAnswer = (value: string) => {
    setAssessmentAnswers((prev) => ({
      ...prev,
      [assessmentQuestions[assessmentStep].id]: value,
    }));
  };

  const handleAssessmentNext = () => {
    if (assessmentStep < assessmentQuestions.length - 1) {
      setAssessmentStep((prev) => prev + 1);
    }
  };

  const handleAssessmentBack = () => {
    if (assessmentStep > 0) {
      setAssessmentStep((prev) => prev - 1);
    } else {
      setStep('form');
    }
  };

  const calculateResults = () => {
    const taskQuestions = assessmentQuestions.filter(q => q.weight > 0);
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let estimatedHours = 0;

    taskQuestions.forEach((q) => {
      const answer = assessmentAnswers[q.id];
      const option = q.options.find((opt) => opt.value === answer);
      const score = option?.score || 0;
      
      totalWeightedScore += score * q.weight;
      totalWeight += q.weight * 100;

      const hourMap: Record<string, number> = {
        heavy: 12,
        moderate: 7,
        light: 4,
        minimal: 1.5,
        automated: 0,
      };
      estimatedHours += (hourMap[answer] || 0) * 0.65;
    });

    const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
    const hourlyRate = 50;
    const estimatedMonthlySavings = Math.round(estimatedHours * 4 * hourlyRate * (overallScore / 100));

    return {
      overallScore,
      estimatedHoursSaved: Math.round(estimatedHours),
      estimatedMonthlySavings,
      businessType: assessmentAnswers.businessType || null,
      monthlyRevenue: assessmentAnswers.monthlyRevenue || null,
      toolStack: assessmentAnswers.toolStack || null,
      timeline: assessmentAnswers.timeline || null,
    };
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
      const results = calculateResults();
      
      // First, save the assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("assessment_responses")
        .insert({
          overall_score: results.overallScore,
          estimated_hours_saved: results.estimatedHoursSaved,
          estimated_monthly_savings: results.estimatedMonthlySavings,
          answers: { ...assessmentAnswers, additional_notes: additionalNotes },
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
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Clear any pending assessment from localStorage
      localStorage.removeItem('pending_assessment_id');
      
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

  const currentQuestion = assessmentQuestions[assessmentStep];
  const currentAnswer = assessmentAnswers[currentQuestion?.id];
  const assessmentProgress = ((assessmentStep + 1) / assessmentQuestions.length) * 100;
  const isLastQuestion = assessmentStep === assessmentQuestions.length - 1;

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
            {step === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Booking Confirmed!</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a confirmation email with all the meeting details.
                </p>
                {bookingResult?.meeting_join_url && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => window.open(bookingResult.meeting_join_url, '_blank')}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Google Meet
                  </Button>
                )}
              </div>
            ) : step === 'assessment' ? (
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handleAssessmentBack}
                  className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {assessmentStep === 0 ? 'Back to details' : 'Previous question'}
                </button>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {assessmentStep + 1} of {assessmentQuestions.length}</span>
                    <span>{Math.round(assessmentProgress)}%</span>
                  </div>
                  <Progress value={assessmentProgress} className="h-2" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {currentQuestion.icon}
                  </div>
                  <span className="text-sm font-medium text-primary">{currentQuestion.category}</span>
                </div>

                <h3 className="font-display text-lg font-semibold mb-6">
                  {currentQuestion.question}
                </h3>

                <RadioGroup
                  value={currentAnswer || ''}
                  onValueChange={handleAssessmentAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        currentAnswer === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAssessmentAnswer(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Additional notes on last question */}
                {isLastQuestion && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <label className="text-sm font-medium">Anything else we should know? (optional)</label>
                    </div>
                    <Textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Tell us about your business, specific challenges, or what you're hoping to achieve..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                <div className="mt-6">
                  {isLastQuestion ? (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleBooking}
                      disabled={!currentAnswer || isSubmitting}
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
                  ) : (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleAssessmentNext}
                      disabled={!currentAnswer}
                    >
                      Continue
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
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
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime && formatTimeDisplay(selectedTime)}
                </p>

                {existingAssessmentId && (
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-lg mb-6">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Assessment already completed</span>
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
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
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
                      <span>Video call via Google Meet</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>{settings?.appointment_duration_minutes || 30} minutes</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      Times shown in Mountain Time (MT)
                    </p>
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
