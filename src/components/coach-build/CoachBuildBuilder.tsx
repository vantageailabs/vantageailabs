import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  Layers, 
  Bot, 
  Mail, 
  BarChart3, 
  Users,
  Clock,
  ChevronDown,
  ArrowRight,
  Lightbulb,
  Zap,
  Target,
  MessageSquare,
  FileText,
  Plug,
  Palette,
  Video,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BuildModule {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  included?: boolean;
}

const modules: BuildModule[] = [
  // Base included
  { id: "strategy-session", name: "Strategy Deep-Dive", description: "Initial funnel & journey mapping session", price: 0, category: "coaching", icon: Lightbulb, included: true },
  { id: "launch-support", name: "30-Day Launch Support", description: "Email support during your first month", price: 0, category: "coaching", icon: Shield, included: true },
  
  // Coaching Add-ons
  { id: "extra-coaching-2h", name: "+2 Hours Coaching", description: "Additional 1-on-1 coaching sessions", price: 400, category: "coaching", icon: Users },
  { id: "extra-coaching-5h", name: "+5 Hours Coaching", description: "Extended coaching package", price: 900, category: "coaching", icon: Users },
  { id: "team-training", name: "Team Training Session", description: "Train your team on the systems we build", price: 600, category: "coaching", icon: Video },
  
  // Build Options
  { id: "landing-page", name: "Landing Page", description: "High-converting single-page site", price: 1500, category: "build", icon: Globe },
  { id: "multi-page-site", name: "Multi-Page Website", description: "Full website with multiple pages", price: 3000, category: "build", icon: Layers },
  { id: "basic-bos", name: "Basic BOS", description: "Business Operating System foundation", price: 3500, category: "build", icon: Zap },
  { id: "custom-app", name: "Custom Application", description: "Tailored web application for your needs", price: 8000, category: "build", icon: Bot },
  
  // Marketing & Automation
  { id: "email-sequences", name: "Email Automation", description: "Welcome & nurture sequences", price: 500, category: "marketing", icon: Mail },
  { id: "lead-capture", name: "Advanced Lead Capture", description: "Multi-step forms with smart routing", price: 400, category: "marketing", icon: Target },
  { id: "sms-automation", name: "SMS Automation", description: "Text message follow-ups", price: 600, category: "marketing", icon: MessageSquare },
  { id: "analytics-setup", name: "Analytics & Tracking", description: "Full conversion tracking setup", price: 350, category: "marketing", icon: BarChart3 },
  
  // Design & Branding
  { id: "brand-basic", name: "Logo Design", description: "Professional logo and basic brand", price: 1000, category: "design", icon: Palette },
  { id: "brand-full", name: "Full Brand Package", description: "Logo, guidelines, colors, typography", price: 5000, category: "design", icon: Palette },
  { id: "copywriting", name: "Copywriting", description: "Professional conversion-focused copy", price: 800, category: "design", icon: FileText },
  
  // Integrations
  { id: "crm-integration", name: "CRM Integration", description: "Connect to HubSpot, Salesforce, etc.", price: 800, category: "integrations", icon: Plug },
  { id: "payment-setup", name: "Payment Processing", description: "Stripe or payment gateway setup", price: 400, category: "integrations", icon: BarChart3 },
  { id: "calendar-booking", name: "Booking System", description: "Calendar integration for appointments", price: 500, category: "integrations", icon: Clock },
];

const categories = [
  { id: "coaching", name: "Coaching & Support", icon: Users, color: "text-primary" },
  { id: "build", name: "Build Options", icon: Globe, color: "text-blue-500" },
  { id: "marketing", name: "Marketing & Automation", icon: Target, color: "text-purple-500" },
  { id: "design", name: "Design & Branding", icon: Palette, color: "text-orange-500" },
  { id: "integrations", name: "Integrations", icon: Plug, color: "text-green-500" },
];

const CoachBuildBuilder = () => {
  const navigate = useNavigate();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [coachingHours, setCoachingHours] = useState(2);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["coaching", "build"]);

  const { totalPrice, roiValue } = useMemo(() => {
    const baseCoachingPrice = coachingHours * 200;
    const modulesPrice = modules
      .filter(m => selectedModules.includes(m.id) && !m.included)
      .reduce((sum, m) => sum + m.price, 0);
    
    const total = baseCoachingPrice + modulesPrice;
    const roi = total * 3; // Estimate 3x ROI
    
    return { totalPrice: total, roiValue: roi };
  }, [selectedModules, coachingHours]);

  const toggleModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.included) return;
    
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Store the submission
      const { data, error } = await supabase.from("bos_builder_submissions").insert({
        email,
        name: name || null,
        business_name: businessName || null,
        selected_modules: { 
          modules: selectedModules, 
          coachingHours,
          type: "coach-build" 
        },
        estimated_price: totalPrice,
        estimated_hours_saved: coachingHours,
        suggested_tier: totalPrice <= 2500 ? "Starter" : totalPrice <= 5000 ? "Professional" : "Enterprise"
      }).select().single();

      if (error) throw error;

      setShowBookingModal(true);
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCall = () => {
    sessionStorage.setItem("pending_coach_build_config", JSON.stringify({
      modules: selectedModules,
      coachingHours,
      totalPrice,
      email,
      name,
      businessName
    }));
    navigate("/book");
  };

  const handleJustSendBlueprint = async () => {
    try {
      await supabase.functions.invoke("send-bos-blueprint", {
        body: { 
          email,
          name,
          businessName,
          selectedModules: { modules: selectedModules, coachingHours, type: "coach-build" },
          estimatedPrice: totalPrice,
          estimatedHoursSaved: coachingHours,
          suggestedTier: totalPrice <= 2500 ? "Starter" : totalPrice <= 5000 ? "Professional" : "Enterprise"
        }
      });
      
      setShowBookingModal(false);
      toast.success("Your custom package blueprint is on its way!");
    } catch (error) {
      console.error("Error sending blueprint:", error);
      toast.error("Failed to send blueprint. Please try again.");
    }
  };

  const selectedCount = selectedModules.filter(id => !modules.find(m => m.id === id)?.included).length;
  const progressValue = Math.min(100, (selectedCount / 5) * 100 + 20);

  return (
    <section id="coach-build-builder" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Design Your <span className="text-primary">Custom Package</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mix and match coaching, build options, and add-ons to create the perfect package for your business.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Module Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Coaching Hours Slider */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Coaching Hours</h3>
                  <p className="text-sm text-muted-foreground">1-on-1 sessions with your coach</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {coachingHours} hours = ${coachingHours * 200}
                </Badge>
              </div>
              <Slider
                value={[coachingHours]}
                onValueChange={(value) => setCoachingHours(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1h</span>
                <span>10h</span>
                <span>20h</span>
              </div>
            </div>

            {/* Category Modules */}
            {categories.map((category) => {
              const categoryModules = modules.filter(m => m.category === category.id);
              const selectedInCategory = categoryModules.filter(m => selectedModules.includes(m.id) || m.included).length;
              
              return (
                <Collapsible 
                  key={category.id} 
                  open={expandedCategories.includes(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <category.icon className={cn("h-5 w-5", category.color)} />
                        <span className="font-medium">{category.name}</span>
                        {selectedInCategory > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedInCategory} selected
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedCategories.includes(category.id) && "rotate-180"
                      )} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid sm:grid-cols-2 gap-3 pt-3">
                      {categoryModules.map((module) => (
                        <button
                          key={module.id}
                          onClick={() => toggleModule(module.id)}
                          disabled={module.included}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            module.included
                              ? "bg-primary/5 border-primary/20 cursor-default"
                              : selectedModules.includes(module.id)
                              ? "bg-primary/10 border-primary"
                              : "bg-card border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <module.icon className={cn(
                              "h-5 w-5 mt-0.5",
                              module.included || selectedModules.includes(module.id) 
                                ? "text-primary" 
                                : "text-muted-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{module.name}</span>
                                {module.included && (
                                  <Badge variant="outline" className="text-[10px] py-0">Included</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                              {!module.included && (
                                <p className="text-xs font-medium text-primary mt-1">+${module.price}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Your Package</h3>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completeness</span>
                  <span className="font-medium">{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated 3x ROI: <span className="text-primary font-medium">${roiValue.toLocaleString()}</span>
                </p>
              </div>

              {/* Selected Items */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Includes:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {coachingHours}h of 1-on-1 coaching</li>
                  {modules.filter(m => m.included).map(m => (
                    <li key={m.id}>• {m.name}</li>
                  ))}
                  {selectedModules.map(id => {
                    const mod = modules.find(m => m.id === id);
                    if (mod && !mod.included) {
                      return <li key={id}>• {mod.name}</li>;
                    }
                    return null;
                  })}
                </ul>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="cb-email" className="text-sm">Email *</Label>
                  <Input
                    id="cb-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cb-name" className="text-sm">Name</Label>
                  <Input
                    id="cb-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cb-business" className="text-sm">Business Name</Label>
                  <Input
                    id="cb-business"
                    placeholder="Your company"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Saving..." : "Get Your Custom Quote"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your package is saved!</DialogTitle>
            <DialogDescription>
              Would you like to discuss your custom package on a quick strategy call?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button onClick={handleBookCall} className="w-full" size="lg">
              Yes, schedule a call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={handleJustSendBlueprint} 
              variant="outline" 
              className="w-full"
            >
              No thanks, just send my quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CoachBuildBuilder;
