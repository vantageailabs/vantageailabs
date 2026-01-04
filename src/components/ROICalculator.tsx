import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Clock, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ROICalculator = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [employees, setEmployees] = useState(5);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const estimatedAutomationRate = 0.65;
  
  // Calculations
  const weeklyTimeSaved = hoursPerWeek * estimatedAutomationRate * employees;
  const weeklySavings = weeklyTimeSaved * hourlyRate;
  const monthlySavings = weeklySavings * 4.33;
  const annualSavings = monthlySavings * 12;
  const fiveYearSavings = annualSavings * 5;
  const annualHoursSaved = weeklyTimeSaved * 52;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('lead_submissions')
        .insert({
          email: email.trim(),
          source: 'roi_calculator'
        });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success("Your ROI report is on its way!");
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="roi-calculator" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Free ROI Calculator</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Calculate Your <span className="text-gradient">AI Savings</span> Potential
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how much time and money your business could save by automating repetitive tasks with AI.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card-elevated p-8 md:p-10">
            {/* Input Section */}
            <div className="space-y-8 mb-8">
              {/* Hours Per Week */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Hours on repetitive tasks per week</label>
                      <p className="text-xs text-muted-foreground">Per employee</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">{hoursPerWeek}h</span>
                </div>
                <Slider
                  value={[hoursPerWeek]}
                  onValueChange={(value) => setHoursPerWeek(value[0])}
                  min={1}
                  max={40}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 hour</span>
                  <span>40 hours</span>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Average hourly labor cost</label>
                      <p className="text-xs text-muted-foreground">Including benefits & overhead</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 text-right text-lg font-bold"
                      min={1}
                      max={500}
                    />
                  </div>
                </div>
              </div>

              {/* Number of Employees */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Number of employees</label>
                      <p className="text-xs text-muted-foreground">Doing these repetitive tasks</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">{employees}</span>
                </div>
                <Slider
                  value={[employees]}
                  onValueChange={(value) => setEmployees(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 person</span>
                  <span>50 people</span>
                </div>
              </div>
            </div>

            {!showResults ? (
              <Button 
                onClick={handleCalculate} 
                variant="default" 
                size="lg" 
                className="w-full"
              >
                Calculate My Savings
                <Calculator className="w-5 h-5" />
              </Button>
            ) : (
              <>
                {/* Results Section */}
                <div className="border-t border-border pt-8 mb-8">
                  <h3 className="font-display text-xl font-semibold mb-6 text-center">
                    Your Estimated AI Savings
                  </h3>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-xl p-5 text-center border border-border">
                      <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold text-primary mb-1">{formatNumber(annualHoursSaved)}</p>
                      <p className="text-sm text-muted-foreground">Hours saved yearly</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 text-center border border-primary/20">
                      <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-3xl font-bold text-accent mb-1">{formatCurrency(annualSavings)}</p>
                      <p className="text-sm text-muted-foreground">Annual savings</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-xl p-5 text-center border border-border">
                      <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold text-primary mb-1">{formatCurrency(fiveYearSavings)}</p>
                      <p className="text-sm text-muted-foreground">5-year projection</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Productivity Impact</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${estimatedAutomationRate * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on industry data, ~65% of repetitive tasks can be automated with AI
                    </p>
                  </div>
                </div>

                {/* Lead Capture */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  {!isSubmitted ? (
                    <>
                      <h4 className="font-semibold mb-2 text-center">Get Your Personalized ROI Report</h4>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        We'll send you a detailed breakdown with implementation recommendations
                      </p>
                      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          variant="accent"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Report"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </form>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        No spam. Your data is secure.
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-accent" />
                      </div>
                      <h4 className="font-semibold mb-1">Report Sent!</h4>
                      <p className="text-sm text-muted-foreground">
                        Check your email for your personalized ROI analysis.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            * Estimates based on industry averages. Actual results may vary based on your specific workflows.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
