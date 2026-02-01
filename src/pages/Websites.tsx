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
];

const Websites = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Website Design for Service Businesses"
        description="Professional website design in Albuquerque starting at $1,500. Mobile-optimized, SEO-ready websites that convert visitors into customers. Fast delivery for New Mexico businesses."
        canonical="/websites"
        keywords="website design Albuquerque, web development New Mexico, small business website, service business website"
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
          <Badge className="mb-4 bg-primary/10 text-primary border-0">Service Business Websites</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Websites That <span className="text-gradient-accent">Convert</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional websites designed to turn visitors into customers for service-based businesses. 
            Fast, mobile-optimized, and built to grow with you.
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
            All packages include 30 days of free support. After that, explore our hosting and maintenance options.
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

export default Websites;
