import { Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Zap, Rocket, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import vantageIcon from "@/assets/vantage-icon.png";
import Footer from "@/components/Footer";

const tiers = [
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
];

const AIAssistants = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Chatbots & Virtual Assistants"
        description="24/7 AI-powered chatbots for your business. Handle customer inquiries, book appointments, and capture leads automatically. Custom AI assistants built in Albuquerque."
        canonical="/ai-assistants"
        keywords="AI chatbot Albuquerque, virtual assistant New Mexico, business chatbot, automated customer service"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={vantageIcon} alt="Vantage AI Labs" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">Vantage AI Labs</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">AI Assistants</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-accent">24/7</span> Intelligent Support
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered assistants that handle customer inquiries, bookings, and support around the clock.
            Never miss a lead again.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {tiers.map((tier, index) => (
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

        {/* Support CTA */}
        <div className="bg-muted/50 border border-border rounded-2xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="font-display text-xl font-bold mb-2">Need Ongoing Support?</h3>
          <p className="text-muted-foreground mb-4">
            All packages include 30 days of free support. After that, explore our maintenance and support options.
          </p>
          <Link to="/support">
            <Button variant="outline" className="gap-2">
              View Support Options <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistants;
