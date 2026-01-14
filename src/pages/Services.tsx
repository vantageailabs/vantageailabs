import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Zap, Rocket } from "lucide-react";
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
          "Google Maps integration",
          "Social media links",
          "1 round of revisions",
          "2 weeks delivery",
        ],
        cta: "Get Started",
      },
      {
        name: "Professional",
        price: "$7,500",
        priceNote: "one-time",
        description: "For established businesses ready to stand out and convert more leads.",
        icon: Zap,
        features: [
          "10-page custom website",
          "Custom UI/UX design",
          "Advanced SEO optimization",
          "Lead capture forms",
          "Online booking integration",
          "Blog/content section",
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
        price: "$18,000",
        priceNote: "starting at",
        description: "Full-scale digital presence with advanced functionality and integrations.",
        icon: Rocket,
        features: [
          "Unlimited pages",
          "Bespoke design & branding",
          "Full SEO strategy",
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
            Transparent pricing for AI-powered solutions that grow your business. Every project includes strategy, implementation, and ongoing support.
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
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          {currentCategory.description}
        </p>

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
                <div
                  className={`inline-flex p-3 rounded-xl mb-4 ${
                    tier.highlighted ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <tier.icon
                    className={`h-6 w-6 ${
                      tier.highlighted ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl md:text-4xl font-bold">{tier.price}</span>
                  {tier.priceNote && (
                    <span className="text-sm text-muted-foreground ml-1">{tier.priceNote}</span>
                  )}
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
                    tier.highlighted
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
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
