import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Zap, Rocket, Shield, MapPin, LayoutDashboard, Clock, Calendar, Headphones, Palette, Search, Download, HelpCircle, FileEdit } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import vantageIcon from "@/assets/vantage-icon.png";

type ServiceCategory = "websites" | "automation" | "ai-assistants" | "custom-apps";

interface ServiceTier {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

interface ServiceCategoryData {
  id: ServiceCategory;
  label: string;
  description: string;
  tiers: ServiceTier[];
}

const serviceCategories: ServiceCategoryData[] = [
  {
    id: "websites",
    label: "Service Business Websites",
    description: "Professional websites designed to convert visitors into customers for service-based businesses.",
    tiers: [
      {
        name: "Starter",
        price: "$1,500",
        priceNote: "one-time",
        description: "Perfect for new businesses needing a professional online presence.",
        icon: Sparkles,
        features: [
          "5-page responsive website",
          "Mobile-optimized design",
          "Basic SEO setup",
          "Contact form integration",
          "Click-to-call button",
          "Google Maps integration",
          "Social media links",
          "1 round of revisions",
          "2 weeks delivery",
        ],
        cta: "Get Started",
      },
      {
        name: "Professional",
        price: "$4,000",
        priceNote: "one-time",
        description: "For established businesses ready to stand out and convert more leads.",
        icon: Zap,
        features: [
          "10-page custom website",
          "Custom UI/UX design",
          "Advanced SEO optimization",
          "Lead capture forms",
          "Interactive estimators",
          "Online booking integration",
          "Blog/content section",
          "Basic CMS dashboard",
          "Analytics dashboard",
          "Speed optimization",
          "3 rounds of revisions",
          "4 weeks delivery",
        ],
        highlighted: true,
        cta: "Most Popular",
      },
      {
        name: "Enterprise",
        price: "$7,000",
        priceNote: "starting at",
        description: "Full-scale digital presence with advanced functionality and integrations.",
        icon: Rocket,
        features: [
          "Unlimited pages",
          "Bespoke design & branding",
          "Full SEO strategy",
          "AI chatbot",
          "Advanced CMS included",
          "CRM integration",
          "Custom booking system",
          "Client portal",
          "E-commerce capabilities",
          "Multi-location support",
          "Priority support",
          "Unlimited revisions",
          "6-8 weeks delivery",
        ],
        cta: "Contact Us",
      },
    ],
  },
  {
    id: "automation",
    label: "Process Automation",
    description: "Streamline your operations and eliminate manual busywork with custom automation solutions.",
    tiers: [
      {
        name: "Starter",
        price: "$1,500",
        priceNote: "one-time",
        description: "Automate a single workflow to save time immediately.",
        icon: Sparkles,
        features: [
          "1 workflow automation",
          "Up to 3 app integrations",
          "Basic error handling",
          "Documentation",
          "30-day support",
        ],
        cta: "Get Started",
      },
      {
        name: "Professional",
        price: "$5,000",
        priceNote: "one-time",
        description: "Comprehensive automation for multiple business processes.",
        icon: Zap,
        features: [
          "Up to 5 workflow automations",
          "Unlimited app integrations",
          "Advanced logic & conditions",
          "Data transformation",
          "Error notifications",
          "Training session",
          "90-day support",
        ],
        highlighted: true,
        cta: "Most Popular",
      },
      {
        name: "Enterprise",
        price: "$12,000",
        priceNote: "starting at",
        description: "End-to-end automation strategy for your entire operation.",
        icon: Rocket,
        features: [
          "Unlimited automations",
          "Custom API integrations",
          "Database connections",
          "Real-time dashboards",
          "Dedicated support",
          "Quarterly optimization",
          "Priority updates",
        ],
        cta: "Contact Us",
      },
    ],
  },
  {
    id: "ai-assistants",
    label: "AI Assistants",
    description: "24/7 intelligent assistants that handle customer inquiries, bookings, and support.",
    tiers: [
      {
        name: "Starter",
        price: "$2,000",
        priceNote: "+ $200/mo",
        description: "Basic AI chatbot for common customer questions.",
        icon: Sparkles,
        features: [
          "FAQ-trained chatbot",
          "Website widget",
          "Up to 500 conversations/mo",
          "Email notifications",
          "Basic analytics",
        ],
        cta: "Get Started",
      },
      {
        name: "Professional",
        price: "$6,000",
        priceNote: "+ $400/mo",
        description: "Smart assistant with booking and lead capture capabilities.",
        icon: Zap,
        features: [
          "Custom-trained AI",
          "Booking integration",
          "Lead qualification",
          "Up to 2,000 conversations/mo",
          "CRM integration",
          "Multi-channel support",
          "Conversation analytics",
        ],
        highlighted: true,
        cta: "Most Popular",
      },
      {
        name: "Enterprise",
        price: "$15,000",
        priceNote: "+ custom/mo",
        description: "Advanced AI with deep integrations and custom capabilities.",
        icon: Rocket,
        features: [
          "GPT-4 powered",
          "Unlimited conversations",
          "Voice capabilities",
          "Full system integration",
          "Custom actions",
          "A/B testing",
          "White-label option",
          "Dedicated account manager",
        ],
        cta: "Contact Us",
      },
    ],
  },
  {
    id: "custom-apps",
    label: "Custom Applications",
    description: "Bespoke software solutions built specifically for your unique business needs.",
    tiers: [
      {
        name: "MVP",
        price: "$10,000",
        priceNote: "starting at",
        description: "Minimum viable product to validate your idea quickly.",
        icon: Sparkles,
        features: [
          "Core feature set",
          "User authentication",
          "Basic admin panel",
          "Responsive design",
          "Cloud hosting setup",
          "4-6 weeks delivery",
        ],
        cta: "Get Started",
      },
      {
        name: "Professional",
        price: "$25,000",
        priceNote: "starting at",
        description: "Full-featured application ready for production use.",
        icon: Zap,
        features: [
          "Complete feature set",
          "Advanced user management",
          "Full admin dashboard",
          "Third-party integrations",
          "Payment processing",
          "Analytics & reporting",
          "8-12 weeks delivery",
        ],
        highlighted: true,
        cta: "Most Popular",
      },
      {
        name: "Enterprise",
        price: "$50,000",
        priceNote: "starting at",
        description: "Complex, scalable solutions for large-scale operations.",
        icon: Rocket,
        features: [
          "Unlimited features",
          "Multi-tenant architecture",
          "Advanced security",
          "API development",
          "Mobile apps (iOS/Android)",
          "Dedicated infrastructure",
          "Ongoing maintenance",
          "24/7 support",
        ],
        cta: "Contact Us",
      },
    ],
  },
];

const Services = () => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("websites");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [brandDesignType, setBrandDesignType] = useState<"basic" | "full">("basic");
  const currentCategory = serviceCategories.find((cat) => cat.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
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

      <main className="container px-4 py-12 md:py-20">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Services & <span className="text-gradient-accent">Pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Transparent pricing for AI-powered solutions that grow your business. Every project includes strategy,
            implementation, and ongoing support.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Category Description */}
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">{currentCategory.description}</p>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {currentCategory.tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "bg-primary/5 border-2 border-primary shadow-xl scale-[1.02]"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${tier.highlighted ? "bg-primary/20" : "bg-muted"}`}>
                  <tier.icon className={`h-6 w-6 ${tier.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl md:text-4xl font-bold">{tier.price}</span>
                  {tier.priceNote && <span className="text-sm text-muted-foreground ml-1">{tier.priceNote}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/book">
                <Button
                  className={`w-full ${
                    tier.highlighted ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Hosting & Maintenance Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-4">
            Hosting & <span className="text-gradient-accent">Maintenance</span>
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            Choose how you want your website hosted and maintained.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingPeriod === "yearly" ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${billingPeriod === "yearly" ? "translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-0">
              Save up to 17%
            </Badge>
          </div>
          
          <TooltipProvider>
            <div className="grid md:grid-cols-3 gap-6">
              {/* On Your Own */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-muted mb-4">
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">On Your Own</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Self-host on your own platform</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Full code ownership</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Deploy anywhere you want</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>No ongoing commitment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 flex-shrink-0">—</span>
                    <span>You manage hosting & SSL</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 flex-shrink-0">—</span>
                    <span>You manage backups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 flex-shrink-0">—</span>
                    <span>No included support</span>
                  </li>
                </ul>
              </div>

              {/* Care Package Lite */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-muted mb-4">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Care Package Lite</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{billingPeriod === "monthly" ? "$29" : "$299"}</span>
                    <span className="text-sm text-muted-foreground ml-1">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-xs text-primary font-medium">Save $49/year</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">Essential hosting with care</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Secure cloud hosting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>SSL certificate</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Weekly backups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      Minor content updates
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Text changes, image swaps, contact info updates, and seasonal banners. Does not include new pages, layout redesigns, or feature additions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Email support (5-day turnaround)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <img src={vantageIcon} alt="" className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                    <span className="text-muted-foreground">"Powered by Vantage AI Labs" badge</span>
                  </li>
                </ul>
              </div>

              {/* Care Package */}
              <div className="bg-primary/5 border-2 border-primary rounded-2xl p-6 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-primary/20 mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Care Package</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{billingPeriod === "monthly" ? "$49" : "$499"}</span>
                    <span className="text-sm text-muted-foreground ml-1">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-xs text-primary font-medium">Save $89/year</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">Full hosting and maintenance</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Secure cloud hosting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>SSL certificate</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Daily backups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      Minor content updates
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Text changes, image swaps, contact info updates, and seasonal banners. Does not include new pages, layout redesigns, or feature additions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>2-day email turnaround</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>No badge required</span>
                  </li>
                </ul>
              </div>
            </div>
          </TooltipProvider>
        </div>

        {/* Support Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-4">
            Ongoing <span className="text-gradient-accent">Support</span>
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            Keep your digital presence running smoothly with flexible support options.
          </p>
          
          {/* Scope Clarification */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="font-semibold text-green-600 mb-2">✓ Covered by Support Hours</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bug fixes & security patches</li>
                <li>• Content updates (text, images)</li>
                <li>• New pages using existing functionality</li>
                <li>• Changes to existing logic (e.g., email addresses, calculations)</li>
                <li>• Performance optimization</li>
              </ul>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="font-semibold text-orange-600 mb-2">✗ Requires Separate Quote</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• New features or functionality</li>
                <li>• Third-party integrations</li>
                <li>• New websites or applications</li>
                <li>• Major redesigns</li>
              </ul>
            </div>
          </div>
          
          {/* 30-day free support banner */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-sm font-medium">
              <span className="text-primary">✓</span> All Starter, Professional, and Enterprise packages include{" "}
              <span className="font-bold text-primary">30 days of free full support</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pay-As-You-Go */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-muted mb-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Pay-As-You-Go</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">$100</span>
                  <span className="text-sm text-muted-foreground ml-1">/hour</span>
                </div>
                <p className="text-sm text-muted-foreground">For occasional updates and fixes</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>No commitment required</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Billed in 30-min increments</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>48-hour response time</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            {/* Monthly Retainer */}
            <div className="bg-primary/5 border-2 border-primary rounded-2xl p-6 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Best Value
              </Badge>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-primary/20 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Monthly Retainer</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{billingPeriod === "monthly" ? "$300" : "$3,000"}</span>
                  <span className="text-sm text-muted-foreground ml-1">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                </div>
                {billingPeriod === "yearly" && (
                  <p className="text-xs text-primary font-medium">Save $600/year</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">Includes hosting + 5 hrs support</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm font-medium text-primary">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Monthly Care Package included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>5 hours of support included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>24-hour response time</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Email & phone support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Monthly check-in call</span>
                </li>
              </ul>
            </div>

            {/* Priority Support */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-muted mb-4">
                  <Headphones className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Priority Support</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{billingPeriod === "monthly" ? "$600" : "$6,000"}</span>
                  <span className="text-sm text-muted-foreground ml-1">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                </div>
                {billingPeriod === "yearly" && (
                  <p className="text-xs text-primary font-medium">Save $1,200/year</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">Includes hosting + 10 hrs support</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm font-medium text-primary">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Monthly Care Package included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>10 hours of support included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Same-day response</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority in queue</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>On-demand check-ins</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
            Add-ons & <span className="text-gradient-accent">Extras</span>
          </h2>
          {/* CMS Comparison */}
          <TooltipProvider>
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Basic CMS */}
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileEdit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Basic CMS</h3>
                    <Badge variant="secondary" className="text-xs">Included in Professional</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Self-service editing for common content updates. Perfect for making quick changes without waiting for support.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Edit existing text & images</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Write & edit blog posts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Update contact info & hours</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Manage team & service listings</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 flex-shrink-0">—</span>
                    <span>Cannot add new pages/sections</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 flex-shrink-0">—</span>
                    <span>Single admin user</span>
                  </li>
                </ul>
                <div className="flex items-baseline justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-bold">$350</span>
                  <span className="text-sm text-muted-foreground">one-time add-on</span>
                </div>
              </div>

              {/* Advanced CMS */}
              <div className="bg-primary/5 border-2 border-primary rounded-xl p-6 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                  Included in Enterprise
                </Badge>
                <div className="flex items-center gap-3 mb-4 pt-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Advanced CMS</h3>
                    <span className="text-xs text-muted-foreground">Full content control</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete content management with full autonomy. Create pages, manage your blog, and control who can edit what.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm font-medium text-primary">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Everything in Basic CMS</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Add new pages & sections</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      User roles (Admin/Editor)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Admins have full access. Editors can update content but cannot change site settings or add new pages.</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Edit SEO meta tags & titles</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Blog categories & scheduling</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Media library management</span>
                  </li>
                </ul>
                <div className="flex items-baseline justify-between pt-4 border-t border-primary/20">
                  <span className="text-2xl font-bold">$750</span>
                  <span className="text-sm text-muted-foreground">one-time add-on</span>
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* CMS vs Retainer Comparison */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 mb-8">
            <h3 className="font-display font-semibold text-lg mb-4 text-center">CMS vs. Monthly Retainer: Which is right for you?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-primary mb-2">Choose CMS if you want:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="text-foreground">Self-service</span> — make changes on your own schedule</li>
                  <li>• <span className="text-foreground">One-time cost</span> — no ongoing fees for content editing</li>
                  <li>• <span className="text-foreground">Frequent updates</span> — you update content weekly or daily</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-primary mb-2">Choose Retainer if you want:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="text-foreground">Done-for-you</span> — we handle all updates for you</li>
                  <li>• <span className="text-foreground">Expert execution</span> — complex changes, new pages, logic updates</li>
                  <li>• <span className="text-foreground">Ongoing support</span> — bug fixes, optimization, strategy calls</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 Many clients combine both: CMS for quick day-to-day edits, plus a retainer for bigger changes and support.
            </p>
          </div>

          {/* Other Add-ons */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Google Business Profile</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Complete setup and optimization of your Google Business Profile for local visibility.
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold">$300</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Logo & Brand Design</h3>
              </div>
              
              {/* Toggle between Basic and Full */}
              <ToggleGroup
                type="single"
                value={brandDesignType}
                onValueChange={(value) => value && setBrandDesignType(value as "basic" | "full")}
                className="justify-start mb-3"
              >
                <ToggleGroupItem value="basic" className="text-xs px-3 py-1 h-7">
                  Basic
                </ToggleGroupItem>
                <ToggleGroupItem value="full" className="text-xs px-3 py-1 h-7">
                  Full Brand
                </ToggleGroupItem>
              </ToggleGroup>
              
              <p className="text-xs text-muted-foreground mb-4">
                {brandDesignType === "basic" 
                  ? "Custom logo designed by a professional designer."
                  : "Complete brand package: logo, guidelines, color palette, typography, and usage rules."
                }
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold">{brandDesignType === "basic" ? "$1,000" : "$5,000"}</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">SEO Starter Package</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Keyword research, on-page optimization, and Google Search Console setup.
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold">$250</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Priority Onboarding</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Skip the queue with expedited delivery and dedicated onboarding support.
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold">$500</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All prices are estimates. Final pricing depends on your specific requirements.
          </p>
          <Link to="/book">
            <Button variant="outline" size="lg">
              Schedule a Free Consultation
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vantage AI Labs. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
