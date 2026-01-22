import { useState, useMemo } from "react";
import { 
  Globe, 
  FileText, 
  MapPin, 
  Inbox, 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Star, 
  Bot, 
  BarChart3, 
  Plug, 
  Users,
  Zap,
  Clock,
  Phone,
  Building2,
  Receipt,
  Package,
  CalendarClock,
  Megaphone,
  Database,
  CreditCard,
  FileSignature,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BOSModuleCard, { type BOSModule } from "./BOSModuleCard";
import { cn } from "@/lib/utils";

// Define all available modules
const allModules: BOSModule[] = [
  // Foundation (included base)
  {
    id: "interface",
    name: "High-Conversion Interface",
    description: "Mobile-first, speed-optimized design that loads in under 1 second",
    price: 0,
    hoursSaved: 0,
    valueMetric: "Foundation",
    icon: Globe,
    tier: "foundation",
    included: true
  },
  {
    id: "intake",
    name: "Standard Lead Intake",
    description: "Categorized forms for residential vs. commercial inquiries",
    price: 0,
    hoursSaved: 0,
    valueMetric: "Foundation",
    icon: FileText,
    tier: "foundation",
    included: true
  },
  {
    id: "gbp",
    name: "Google Business Profile Sync",
    description: "Full GBP setup and optimization for local 'Near Me' ranking",
    price: 0,
    hoursSaved: 0,
    valueMetric: "Local SEO",
    icon: MapPin,
    tier: "foundation",
    included: true
  },
  {
    id: "inbox",
    name: "Unified Inbox",
    description: "All form submissions routed to one central, manageable dashboard",
    price: 0,
    hoursSaved: 1,
    valueMetric: "Foundation",
    icon: Inbox,
    tier: "foundation",
    included: true
  },
  {
    id: "notifications",
    name: "Lead Email Notifications",
    description: "Instant email alerts for every new inquiry",
    price: 0,
    hoursSaved: 0,
    valueMetric: "Foundation",
    icon: Bell,
    tier: "foundation",
    included: true
  },
  // Growth tier add-ons
  {
    id: "recovery",
    name: "Lead Recovery Module",
    description: "Captures partial emails as visitors type and sends 'Did you forget?' follow-ups",
    price: 750,
    hoursSaved: 2,
    valueMetric: "+15% Lead Volume",
    icon: Mail,
    tier: "growth"
  },
  {
    id: "sms",
    name: "SMS Speed-to-Lead",
    description: "Automated text sent to the client within 30 seconds of form submit",
    price: 500,
    hoursSaved: 3,
    valueMetric: "+2x Booking Rate",
    icon: MessageSquare,
    tier: "growth"
  },
  {
    id: "booking",
    name: "Direct Booking Integration",
    description: "Let clients see your actual availability and book appointments on the fly",
    price: 400,
    hoursSaved: 4,
    valueMetric: "Frictionless Sales",
    icon: Calendar,
    tier: "growth"
  },
  {
    id: "reviews",
    name: "Review Booster",
    description: "Automated Google review requests once a job is marked complete",
    price: 350,
    hoursSaved: 1,
    valueMetric: "SEO Authority",
    icon: Star,
    tier: "growth"
  },
  {
    id: "nurture",
    name: "7-Day Nurture Sequence",
    description: "Automated email sequence for leads that don't convert immediately",
    price: 400,
    hoursSaved: 2,
    valueMetric: "+20% Conversions",
    icon: Clock,
    tier: "growth"
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation",
    description: "Seasonal campaigns, promotions, and email drip sequences",
    price: 700,
    hoursSaved: 3,
    valueMetric: "Revenue Growth",
    icon: Megaphone,
    tier: "growth"
  },
  {
    id: "payment-processing",
    name: "Payment Processing",
    description: "Accept cards on-site or online with automated receipts",
    price: 500,
    hoursSaved: 2,
    valueMetric: "Convenience",
    icon: CreditCard,
    tier: "growth"
  },
  {
    id: "estimate-builder",
    name: "Digital Estimate Builder",
    description: "Create professional estimates on-site with e-signatures",
    price: 650,
    hoursSaved: 4,
    valueMetric: "Close Faster",
    icon: FileSignature,
    tier: "growth"
  },
  {
    id: "warranty-tracking",
    name: "Warranty & Maintenance Tracking",
    description: "Automated reminders for service agreements and warranties",
    price: 550,
    hoursSaved: 2,
    valueMetric: "Recurring Revenue",
    icon: Shield,
    tier: "growth"
  },
  // Scale tier add-ons
  {
    id: "ai-agent",
    name: "AI Intake Agent",
    description: "24/7 chatbot that pre-qualifies leads and answers basic FAQs",
    price: 1500,
    hoursSaved: 5,
    valueMetric: "Saves 5 hrs/week",
    icon: Bot,
    tier: "scale"
  },
  {
    id: "ai-phone",
    name: "AI Phone Agent",
    description: "Voice AI that answers calls, books appointments, and routes emergencies",
    price: 2000,
    hoursSaved: 8,
    valueMetric: "24/7 Availability",
    icon: Phone,
    tier: "scale"
  },
  {
    id: "dashboard",
    name: "Performance Dashboard",
    description: "Visual analytics for Lead-to-Close ratios and Ad spend ROI",
    price: 800,
    hoursSaved: 2,
    valueMetric: "Data Visibility",
    icon: BarChart3,
    tier: "scale"
  },
  {
    id: "field-sync",
    name: "Field Tool Integration",
    description: "Two-way sync with Jobber, Housecall Pro, or ServiceTitan",
    price: 1000,
    hoursSaved: 4,
    valueMetric: "Operations",
    icon: Plug,
    tier: "scale"
  },
  {
    id: "portal",
    name: "Customer Portal",
    description: "Private area for clients to see project photos, status, and invoices",
    price: 1200,
    hoursSaved: 3,
    valueMetric: "Trust & Transparency",
    icon: Users,
    tier: "scale"
  },
  {
    id: "multi-location",
    name: "Multi-Location Support",
    description: "Manage multiple service areas with territory routing",
    price: 1500,
    hoursSaved: 4,
    valueMetric: "Scalability",
    icon: Building2,
    tier: "scale"
  },
  {
    id: "invoicing",
    name: "Automated Invoicing",
    description: "Generate and send invoices automatically when jobs complete",
    price: 900,
    hoursSaved: 5,
    valueMetric: "Faster Payments",
    icon: Receipt,
    tier: "scale"
  },
  {
    id: "inventory",
    name: "Inventory Tracking",
    description: "Track parts and materials across trucks and warehouse",
    price: 750,
    hoursSaved: 3,
    valueMetric: "Cost Control",
    icon: Package,
    tier: "scale"
  },
  {
    id: "employee-scheduling",
    name: "Employee Scheduling",
    description: "Automated tech dispatch and route optimization",
    price: 850,
    hoursSaved: 4,
    valueMetric: "Efficiency",
    icon: CalendarClock,
    tier: "scale"
  },
  {
    id: "crm-sync",
    name: "CRM Integration",
    description: "Two-way sync with Salesforce, HubSpot, or Zoho",
    price: 1100,
    hoursSaved: 3,
    valueMetric: "Data Sync",
    icon: Database,
    tier: "scale"
  }
];

// Tier definitions for comparison
const tierPackages = [
  { id: "foundation", name: "Foundation BOS", price: 3500 },
  { id: "growth", name: "Growth Engine", price: 6500 },
  { id: "scale", name: "Scale OS", price: 12000 }
];

const BOSBuilder = () => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate totals
  const { totalPrice, totalHoursSaved, efficiencyScore } = useMemo(() => {
    const basePrice = 3500; // Foundation base
    const selected = allModules.filter(m => selectedModules.includes(m.id) && !m.included);
    const addOnPrice = selected.reduce((sum, m) => sum + m.price, 0);
    const hoursSaved = selected.reduce((sum, m) => sum + m.hoursSaved, 0) + 1; // +1 for base
    
    // Efficiency score: 0-100 based on modules selected
    const maxModules = allModules.filter(m => !m.included).length;
    const score = Math.min(100, Math.round((selectedModules.length / maxModules) * 100) + 20);
    
    return {
      totalPrice: basePrice + addOnPrice,
      totalHoursSaved: hoursSaved,
      efficiencyScore: score
    };
  }, [selectedModules]);

  // Determine suggested tier and savings
  const { suggestedTier, savings } = useMemo(() => {
    if (totalPrice <= 3500) return { suggestedTier: tierPackages[0], savings: 0 };
    if (totalPrice <= 6500) {
      const diff = 6500 - totalPrice;
      return { 
        suggestedTier: tierPackages[1], 
        savings: diff > 0 ? diff : 0 
      };
    }
    const diff = 12000 - totalPrice;
    return { 
      suggestedTier: tierPackages[2], 
      savings: diff > 0 ? diff : 0 
    };
  }, [totalPrice]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from("bos_builder_submissions")
        .insert({
          email,
          name: name || null,
          business_name: businessName || null,
          selected_modules: selectedModules,
          estimated_price: totalPrice,
          estimated_hours_saved: totalHoursSaved,
          suggested_tier: suggestedTier.name
        });

      if (dbError) throw dbError;

      // Send blueprint email
      const { error: emailError } = await supabase.functions.invoke("send-bos-blueprint", {
        body: { 
          email, 
          name,
          businessName,
          selectedModules,
          totalPrice,
          totalHoursSaved,
          suggestedTier: suggestedTier.name
        }
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the whole submission if email fails
      }

      setIsSubmitted(true);
      toast.success("Your custom blueprint has been sent!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const foundationModules = allModules.filter(m => m.tier === "foundation");
  const growthModules = allModules.filter(m => m.tier === "growth");
  const scaleModules = allModules.filter(m => m.tier === "scale");

  return (
    <section id="bos-builder" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Zap className="h-3 w-3 mr-1" />
            Interactive
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Build Your Own <span className="text-primary">BOS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Toggle the features you need and see your custom price in real-time. 
            Get a personalized blueprint sent to your inbox.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Foundation - always included */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-muted rounded text-xs">Base</span>
                Foundation Features
                <span className="text-xs text-muted-foreground">(Included)</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {foundationModules.map(module => (
                  <BOSModuleCard
                    key={module.id}
                    module={module}
                    isSelected={true}
                    onToggle={() => {}}
                    disabled
                  />
                ))}
              </div>
            </div>

            {/* Growth modules */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Growth</span>
                Automation Add-ons
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {growthModules.map(module => (
                  <BOSModuleCard
                    key={module.id}
                    module={module}
                    isSelected={selectedModules.includes(module.id)}
                    onToggle={() => toggleModule(module.id)}
                  />
                ))}
              </div>
            </div>

            {/* Scale modules */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-accent/20 text-accent-foreground rounded text-xs">Scale</span>
                Enterprise Features
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {scaleModules.map(module => (
                  <BOSModuleCard
                    key={module.id}
                    module={module}
                    isSelected={selectedModules.includes(module.id)}
                    onToggle={() => toggleModule(module.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Summary panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Your Custom BOS</h3>

              {/* Efficiency meter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Business Efficiency</span>
                  <span className="text-sm font-bold text-primary">{efficiencyScore}%</span>
                </div>
                <Progress value={efficiencyScore} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{totalHoursSaved}</p>
                  <p className="text-xs text-muted-foreground">hrs/week saved</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{selectedModules.length}</p>
                  <p className="text-xs text-muted-foreground">add-ons selected</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="text-3xl font-bold">${totalPrice.toLocaleString()}</span>
                </div>
                
                {/* Tier suggestion with savings */}
                {savings > 0 && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <p className="text-xs text-primary">
                      💡 Your build is close to the <strong>{suggestedTier.name}</strong> package. 
                      Upgrade and save <strong>${savings.toLocaleString()}</strong> while getting even more features!
                    </p>
                  </div>
                )}
              </div>

              {/* Lead capture form */}
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Get your custom blueprint with detailed ROI projections sent to your inbox.
                  </p>
                  <div>
                    <Label htmlFor="builder-email" className="text-xs">Email *</Label>
                    <Input
                      id="builder-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="builder-name" className="text-xs">Name</Label>
                    <Input
                      id="builder-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="builder-business" className="text-xs">Business Name</Label>
                    <Input
                      id="builder-business"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Smith HVAC"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Get Your Blueprint"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Blueprint Sent!</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for your custom BOS blueprint with detailed ROI projections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BOSBuilder;
