import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Database, 
  Calendar, 
  BarChart3, 
  Headphones, 
  UserCheck, 
  Receipt, 
  Share2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  DollarSign,
  Layers,
  Clock,
  CalendarCheck
} from "lucide-react";

interface Question {
  id: string;
  category: string;
  icon: React.ReactNode;
  question: string;
  options: { value: string; label: string; score: number }[];
  weight: number;
}

const questions: Question[] = [
  {
    id: "email",
    category: "Email & Communication",
    icon: <Mail className="h-6 w-6" />,
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
    icon: <Database className="h-6 w-6" />,
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
    icon: <Calendar className="h-6 w-6" />,
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
    icon: <BarChart3 className="h-6 w-6" />,
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
    icon: <Headphones className="h-6 w-6" />,
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
    icon: <UserCheck className="h-6 w-6" />,
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
    icon: <Receipt className="h-6 w-6" />,
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
    icon: <Share2 className="h-6 w-6" />,
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
  // Business Context Questions
  {
    id: "businessType",
    category: "Business Profile",
    icon: <Building2 className="h-6 w-6" />,
    question: "What type of business do you operate?",
    options: [
      { value: "ecommerce", label: "E-commerce/Retail - Online store, physical products, inventory", score: 0 },
      { value: "professional", label: "Professional Services - Consulting, agencies, client projects", score: 0 },
      { value: "saas", label: "SaaS/Technology - Software platform, digital products, subscriptions", score: 0 },
      { value: "local", label: "Local Business - Restaurant, healthcare, fitness, local services", score: 0 },
      { value: "b2b", label: "B2B Services - Lead generation, sales processes, B2B relationships", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "monthlyRevenue",
    category: "Revenue Range",
    icon: <DollarSign className="h-6 w-6" />,
    question: "What is your current monthly revenue range?",
    options: [
      { value: "50k_plus", label: "$50,000+ monthly - Established business with significant ROI potential", score: 0 },
      { value: "20k_50k", label: "$20,000-$49,999 monthly - Growing business ready for efficiency", score: 0 },
      { value: "10k_20k", label: "$10,000-$19,999 monthly - Scaling business needing time-saving automation", score: 0 },
      { value: "5k_10k", label: "$5,000-$9,999 monthly - Early growth stage with automation opportunities", score: 0 },
      { value: "under_5k", label: "Under $5,000 monthly - Startup phase focused on efficiency", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "toolStack",
    category: "Current Tool Stack",
    icon: <Layers className="h-6 w-6" />,
    question: "What does your current technology stack look like?",
    options: [
      { value: "advanced", label: "Advanced Stack - CRM, marketing automation, project management, analytics", score: 0 },
      { value: "moderate", label: "Moderate Stack - Email platform, basic CRM, accounting software, social tools", score: 0 },
      { value: "basic", label: "Basic Stack - Email, spreadsheets, basic website, minimal software", score: 0 },
      { value: "starting", label: "Starting Stack - Gmail, social media, basic website, looking to add tools", score: 0 },
      { value: "manual", label: "Manual Operations - Primarily manual processes, minimal software usage", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "timeline",
    category: "Investment Timeline",
    icon: <Clock className="h-6 w-6" />,
    question: "When would you like to implement automation?",
    options: [
      { value: "immediate", label: "Immediate - Ready to start within 1-2 weeks", score: 0 },
      { value: "fast", label: "Fast Track - Want to begin within 3-4 weeks", score: 0 },
      { value: "standard", label: "Standard Timeline - Ready within 1-2 months", score: 0 },
      { value: "future", label: "Future Planning - Interested in 3-6 months", score: 0 },
      { value: "research", label: "Information Gathering - Researching options, timeline flexible", score: 0 },
    ],
    weight: 0,
  },
];

interface CategoryResult {
  category: string;
  score: number;
  icon: React.ReactNode;
}

const AIReadinessAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep].id]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Separate task questions from business context questions
  const taskQuestions = questions.filter(q => q.weight > 0);
  const businessQuestions = questions.filter(q => q.weight === 0);

  const calculateResults = (): { 
    overallScore: number; 
    categories: CategoryResult[]; 
    estimatedHoursSaved: number;
    estimatedMonthlySavings: number;
    businessContext: {
      businessType: string;
      revenue: string;
      toolStack: string;
      timeline: string;
    };
  } => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let estimatedHours = 0;

    const categories: CategoryResult[] = taskQuestions.map((q) => {
      const answer = answers[q.id];
      const option = q.options.find((opt) => opt.value === answer);
      const score = option?.score || 0;
      
      totalWeightedScore += score * q.weight;
      totalWeight += q.weight * 100;

      // Estimate hours based on answer
      const hourMap: Record<string, number> = {
        heavy: 12,
        moderate: 7,
        light: 4,
        minimal: 1.5,
        automated: 0,
      };
      estimatedHours += (hourMap[answer] || 0) * 0.65; // 65% automation potential

      return {
        category: q.category,
        score,
        icon: q.icon,
      };
    });

    const overallScore = Math.round((totalWeightedScore / totalWeight) * 100);

    // Calculate estimated monthly savings based on revenue
    const revenueMap: Record<string, number> = {
      "50k_plus": 5000,
      "20k_50k": 2500,
      "10k_20k": 1500,
      "5k_10k": 800,
      "under_5k": 400,
    };
    const hourlyRate = 50; // Assumed hourly value
    const estimatedMonthlySavings = Math.round(estimatedHours * 4 * hourlyRate * (overallScore / 100));

    const businessContext = {
      businessType: answers.businessType || "",
      revenue: answers.monthlyRevenue || "",
      toolStack: answers.toolStack || "",
      timeline: answers.timeline || "",
    };

    return { overallScore, categories, estimatedHoursSaved: Math.round(estimatedHours), estimatedMonthlySavings, businessContext };
  };

  const getScoreLabel = (score: number): { label: string; color: string } => {
    if (score >= 70) return { label: "High Automation Potential", color: "text-green-500" };
    if (score >= 40) return { label: "Moderate Automation Potential", color: "text-yellow-500" };
    return { label: "Low Automation Potential", color: "text-muted-foreground" };
  };

  const getTopRecommendations = (categories: CategoryResult[]): CategoryResult[] => {
    return [...categories]
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleSaveAndSchedule = async () => {
    setIsSubmitting(true);
    try {
      const results = calculateResults();
      
      const { data, error } = await supabase.from("assessment_responses").insert({
        overall_score: results.overallScore,
        estimated_hours_saved: results.estimatedHoursSaved,
        estimated_monthly_savings: results.estimatedMonthlySavings,
        answers: answers,
        business_type: results.businessContext.businessType || null,
        monthly_revenue: results.businessContext.revenue || null,
        tool_stack: results.businessContext.toolStack || null,
        timeline: results.businessContext.timeline || null,
      }).select().single();

      if (error) throw error;

      // Store assessment ID in localStorage for booking flow to link
      if (data) {
        localStorage.setItem('pending_assessment_id', data.id);
      }

      // Scroll to booking section
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }

      toast({
        title: "Assessment Saved!",
        description: "Now let's schedule your strategy call.",
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion?.id];

  // Determine if we're in task phase or business phase
  const isBusinessPhase = currentStep >= taskQuestions.length;
  const phaseProgress = isBusinessPhase 
    ? ((currentStep - taskQuestions.length + 1) / businessQuestions.length) * 100
    : ((currentStep + 1) / taskQuestions.length) * 100;

  if (showResults) {
    const { overallScore, categories, estimatedHoursSaved, estimatedMonthlySavings, businessContext } = calculateResults();
    const { label, color } = getScoreLabel(overallScore);
    const topRecommendations = getTopRecommendations(categories);

    // Get timeline message
    const timelineMessages: Record<string, string> = {
      immediate: "We can get started right away.",
      fast: "We'll have you up and running in 3-4 weeks.",
      standard: "A 1-2 month timeline allows for thorough implementation.",
      future: "We'll keep you informed and ready for when you're prepared.",
      research: "Take your time—we're here when you're ready.",
    };

    return (
      <section id="assessment" className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Assessment Complete
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Automation Assessment Results
            </h2>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              {/* Overall Score */}
              <div className="text-center mb-8 pb-8 border-b">
                <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                <div className="text-lg text-muted-foreground mb-1">out of 100</div>
                <div className={`text-lg font-semibold ${color}`}>{label}</div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{estimatedHoursSaved}</div>
                  <div className="text-xs text-muted-foreground">Hours/week saved</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{estimatedHoursSaved * 52}</div>
                  <div className="text-xs text-muted-foreground">Hours/year saved</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${estimatedMonthlySavings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Est. monthly savings</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${(estimatedMonthlySavings * 12).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Est. annual savings</div>
                </div>
              </div>

              {/* Implementation Insights */}
              {businessContext.timeline && (
                <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Your Implementation Path
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {timelineMessages[businessContext.timeline] || ""}
                  </p>
                </div>
              )}

              {/* Category Breakdown */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Priority Areas</h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div className="text-muted-foreground">{cat.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.category}</span>
                          <span className="text-muted-foreground">{cat.score}%</span>
                        </div>
                        <Progress value={cat.score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Recommendations */}
              {topRecommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Top Recommendations</h3>
                  <div className="space-y-3">
                    {topRecommendations.map((rec, index) => (
                      <div
                        key={rec.category}
                        className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          {rec.icon}
                          <span className="font-medium">{rec.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Call CTA */}
              <div className="bg-primary/10 rounded-lg p-6 text-center">
                <h3 className="font-semibold mb-2 text-lg">Ready to Unlock Your Automation Potential?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a free strategy call and we'll create a personalized automation roadmap for your business.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleSaveAndSchedule}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <CalendarCheck className="h-5 w-5 mr-2" />
                      Schedule Your Strategy Call
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setAnswers({});
              }}
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="assessment" className="py-20 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {isBusinessPhase ? "Almost Done!" : "Free Assessment"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isBusinessPhase ? "Help Us Personalize Your Results" : "Discover Your Automation Opportunities"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isBusinessPhase 
              ? "A few more questions to tailor your automation roadmap"
              : "Answer a few quick questions to see where AI can save you the most time"
            }
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              {isBusinessPhase 
                ? `Business Profile ${currentStep - taskQuestions.length + 1} of ${businessQuestions.length}`
                : `Task Assessment ${currentStep + 1} of ${taskQuestions.length}`
              }
            </span>
            <span>Question {currentStep + 1} of {questions.length}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Progress value={isBusinessPhase ? 100 : phaseProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Task Questions</p>
            </div>
            <div className="flex-1">
              <Progress value={isBusinessPhase ? phaseProgress : 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Business Profile</p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                {currentQuestion.icon}
              </div>
              <span className="text-sm font-medium text-primary">
                {currentQuestion.category}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

            <RadioGroup
              value={currentAnswer || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 p-4 border rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!currentAnswer}>
                {currentStep === questions.length - 1 ? "See Results" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIReadinessAssessment;
