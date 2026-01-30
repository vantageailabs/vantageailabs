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
  coachingHours: number;
  features: { text: string; premium?: boolean }[];
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Launch Right",
    price: 2500,
    target: "Solo founders and side projects ready to launch properly",
    coachingHours: 2,
    features: [
      { text: "Custom landing page or simple website" },
      { text: "2 hours of 1-on-1 coaching" },
      { text: "Funnel strategy & customer journey mapping" },
      { text: "Lead capture setup with email integration" },
      { text: "Basic analytics & tracking" },
      { text: "30 days post-launch support" }
    ]
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Scale Smart",
    price: 5000,
    target: "Growing businesses that need a proper system",
    popular: true,
    coachingHours: 5,
    features: [
      { text: "Everything in Starter" },
      { text: "5 hours of coaching sessions", premium: true },
      { text: "Multi-page website or basic BOS" },
      { text: "Email automation sequences", premium: true },
      { text: "Lead psychology & conversion optimization" },
      { text: "Basic CMS for self-management" },
      { text: "60 days post-launch support" }
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Full Transformation",
    price: 10000,
    target: "Established businesses ready for a complete overhaul",
    coachingHours: 10,
    features: [
      { text: "Everything in Professional" },
      { text: "10 hours of coaching sessions", premium: true },
      { text: "Full BOS or custom application" },
      { text: "Advanced automation & AI features", premium: true },
      { text: "Team training sessions" },
      { text: "Custom integrations & workflows" },
      { text: "Priority support for 90 days" }
    ]
  }
];

const CoachBuildTiers = () => {
  return (
    <section id="coach-build-tiers" className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="text-primary">Growth Path</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every package includes both the build AND the coaching to make it work. No guesswork.
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

              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <Badge variant="secondary" className="text-xs">
                  {tier.coachingHours}h coaching included
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
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
            Need something more specific?
          </p>
          <button 
            onClick={() => document.getElementById("coach-build-builder")?.scrollIntoView({ behavior: "smooth" })}
            className="text-primary font-medium hover:underline"
          >
            Design your own package below →
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoachBuildTiers;
