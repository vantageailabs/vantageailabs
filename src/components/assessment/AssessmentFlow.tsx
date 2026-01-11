import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CalendarCheck, 
  Send,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  MessageSquare
} from "lucide-react";
import { 
  assessmentQuestions, 
  calculateAssessmentResults, 
  getScoreLabel, 
  getTopRecommendations,
  timelineMessages,
  type AssessmentResults,
  type CategoryResult
} from "@/lib/assessmentQuestions";

export type AssessmentMode = "booking" | "standalone";

interface AssessmentFlowProps {
  mode: AssessmentMode;
  onComplete: (results: AssessmentResults & { categories: CategoryResult[] }, answers: Record<string, string>, additionalNotes?: string) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

const AssessmentFlow = ({ mode, onComplete, onBack, isSubmitting = false }: AssessmentFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });

  const taskQuestions = assessmentQuestions.filter(q => q.weight > 0);
  const businessQuestions = assessmentQuestions.filter(q => q.weight === 0);
  const isBusinessPhase = currentStep >= taskQuestions.length;
  const phaseProgress = isBusinessPhase 
    ? ((currentStep - taskQuestions.length + 1) / businessQuestions.length) * 100
    : ((currentStep + 1) / taskQuestions.length) * 100;

  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;
  const isLastQuestion = currentStep === assessmentQuestions.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [assessmentQuestions[currentStep].id]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last question - behavior depends on mode
      if (mode === "booking") {
        // In booking mode, directly complete (no results screen)
        const results = calculateAssessmentResults(answers);
        onComplete(results, answers, additionalNotes);
      } else {
        // In standalone mode, show results
        setShowResults(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const currentQuestion = assessmentQuestions[currentStep];
  const currentAnswer = answers[currentQuestion?.id];

  // Standalone mode: Results screen with two options
  if (mode === "standalone" && showResults) {
    const results = calculateAssessmentResults(answers);
    const { label, color } = getScoreLabel(results.overallScore);
    const topRecommendations = getTopRecommendations(results.categories);

    const handleScheduleCall = () => {
      onComplete(results, answers, additionalNotes);
    };

    return (
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
              <div className="text-6xl font-bold text-primary mb-2">{results.overallScore}</div>
              <div className="text-lg text-muted-foreground mb-1">out of 100</div>
              <div className={`text-lg font-semibold ${color}`}>{label}</div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{results.estimatedHoursSaved}</div>
                <div className="text-xs text-muted-foreground">Hours/week saved</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{results.estimatedHoursSaved * 52}</div>
                <div className="text-xs text-muted-foreground">Hours/year saved</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">${results.estimatedMonthlySavings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Est. monthly savings</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">${(results.estimatedMonthlySavings * 12).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Est. annual savings</div>
              </div>
            </div>

            {/* Implementation Insights */}
            {results.timeline && (
              <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Your Implementation Path
                </h3>
                <p className="text-sm text-muted-foreground">
                  {timelineMessages[results.timeline] || ""}
                </p>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Priority Areas</h3>
              <div className="space-y-3">
                {results.categories.map((cat) => (
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

            {/* CTA Section - Two Options for Standalone */}
            <div className="bg-primary/10 rounded-lg p-6">
              {!showEmailCapture ? (
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-lg">Ready to Unlock Your Automation Potential?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule a free strategy call and we'll create a personalized automation roadmap for your business.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      size="lg" 
                      onClick={handleScheduleCall}
                      disabled={isSubmitting}
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
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => setShowEmailCapture(true)}
                      disabled={isSubmitting}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Just Send Me the Results
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg">Get Your Personalized Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your details and we'll send you a personalized follow-up with recommendations.
                    </p>
                  </div>
                  <div className="grid gap-3 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="contact-name">Name *</Label>
                      <Input
                        id="contact-name"
                        placeholder="Your name"
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="your@email.com"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone (optional)</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailCapture(false)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        // Pass contact info through answers
                        const answersWithContact = {
                          ...answers,
                          contact_name: contactInfo.name,
                          contact_email: contactInfo.email,
                          contact_phone: contactInfo.phone,
                          action: 'email_only'
                        };
                        onComplete(results, answersWithContact, additionalNotes);
                      }}
                      disabled={isSubmitting || !contactInfo.name || !contactInfo.email}
                    >
                      {isSubmitting ? "Sending..." : "Send My Results"}
                    </Button>
                  </div>
                </div>
              )}
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
              setShowEmailCapture(false);
            }}
          >
            Retake Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Booking mode: Compact question UI with single CTA at end
  if (mode === "booking") {
    return (
      <div className="max-w-lg mx-auto">
        <button
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Back to details' : 'Previous question'}
        </button>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentStep + 1} of {assessmentQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
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
          onValueChange={handleAnswer}
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
              onClick={() => handleAnswer(option.value)}
            >
              <RadioGroupItem value={option.value} id={`booking-${option.value}`} />
              <Label htmlFor={`booking-${option.value}`} className="flex-1 cursor-pointer text-sm">
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
              onClick={handleNext}
              disabled={!currentAnswer || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  Schedule Call
                  <Calendar className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Standalone mode: Question UI (before results)
  return (
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
          <span>Question {currentStep + 1} of {assessmentQuestions.length}</span>
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
                  id={`standalone-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`standalone-${option.value}`}
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
              disabled={currentStep === 0 && !onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!currentAnswer}>
              {isLastQuestion ? "See Results" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentFlow;
