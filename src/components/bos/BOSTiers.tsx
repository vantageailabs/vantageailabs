import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  target: string;
  popular?: boolean;
  features: { text: string; premium?: boolean }[];
}

const tiers: Tier[] = [
  {
    id: "foundation",
    name: "Foundation BOS",
    tagline: "Your Digital HQ",
    price: 3500,
    target: "New or smaller LLCs needing a professional digital presence",
    features: [
      { text: "High-Conversion Interface (mobile-first, sub-1s load)" },
      { text: "Standard Lead Intake (categorized forms)" },
      { text: "Google Maps/GBP Sync & Optimization" },
      { text: "Unified Inbox (all submissions in one dashboard)" },
      { text: "Lead Email Notifications" },
      { text: "30 Days Full Support Included" }
    ]
  },
  {
    id: "growth",
    name: "Growth Engine",
    tagline: "Automate the Chase",
    price: 6500,
    target: "Established teams ready to automate follow-ups",
    popular: true,
    features: [
      { text: "Everything in Foundation" },
      { text: "Lead Recovery (capture partial emails)", premium: true },
      { text: "SMS Instant Response (auto-text on submit)", premium: true },
      { text: "Direct Scheduling Integration" },
      { text: "Automatic Review Requests (post-job)" },
      { text: "7-Day Email Nurture Sequences" },
      { text: "60 Days Full Support Included" }
    ]
  },
  {
    id: "scale",
    name: "Scale OS",
    tagline: "Remove Yourself from Day-to-Day",
    price: 12000,
    target: "Multi-truck operations looking to scale",
    features: [
      { text: "Everything in Growth Engine" },
      { text: "AI Intake Agent (24/7 chatbot)", premium: true },
      { text: "Performance Dashboard (Lead-to-Close, ROI)", premium: true },
      { text: "Field Tool Integration (Jobber, Housecall Pro, ServiceTitan)" },
      { text: "Customer Portal (project status, photos, invoices)" },
      { text: "Priority Support (same-day response)" },
      { text: "90 Days Full Support Included" }
    ]
  }
];

const BOSTiers = () => {
  return (
    <section id="bos-tiers" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="text-primary">Operating System</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three tiers designed to meet you where you are—and grow with you as you scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative bg-card border rounded-2xl p-6 flex flex-col",
                tier.popular 
                  ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                  : "border-border"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-primary">{tier.tagline}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${tier.price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">one-time investment</p>
              </div>

              <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                {tier.target}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      feature.premium ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm",
                      feature.premium ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {feature.text}
                      {feature.premium && (
                        <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-primary/30 text-primary">
                          Premium
                        </Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                asChild
                variant={tier.popular ? "default" : "outline"}
                className="w-full"
              >
                <Link to="/book">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Custom option teaser */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-2">
            Need something more tailored?
          </p>
          <button 
            onClick={() => document.getElementById("bos-builder")?.scrollIntoView({ behavior: "smooth" })}
            className="text-primary font-medium hover:underline"
          >
            Build your own custom package below →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BOSTiers;
