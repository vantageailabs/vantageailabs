import { Link } from "react-router-dom";
import { Bot, Workflow, Rocket, Shield, Sparkles, Target, Layers, ArrowRight } from "lucide-react";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
  link?: string;
  featured?: boolean;
}

const services: Service[] = [
  {
    icon: Layers,
    title: "Business Operating System",
    description: "A complete digital infrastructure that automates leads, operations, and customer experience—built around YOUR workflow.",
    highlight: "Your business, systematized",
    link: "/bos",
    featured: true,
  },
  {
    icon: Workflow,
    title: "Process Automation",
    description: "Connect your tools, eliminate data entry, and let automations handle the busywork.",
    highlight: "Save 20+ hours/week",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Apps",
    description: "Native applications built specifically for your workflows—no bloated SaaS subscriptions.",
    highlight: "Built for YOUR business",
  },
  {
    icon: Target,
    title: "Lead Capture & Follow-Up",
    description: "Automated forms, instant responses, and smart follow-up sequences that convert visitors into customers.",
    highlight: "Never lose a lead again",
  },
  {
    icon: Shield,
    title: "Coach + Build",
    description: "Your build (website, BOS, or app) plus hands-on guidance—funnels, lead psychology, email best practices, and automation strategy.",
    highlight: "Build smarter from day one",
  },
  {
    icon: Rocket,
    title: "Implementation & Training",
    description: "We build, train your team, and deploy custom AI assistants that handle inquiries and support 24/7.",
    highlight: "Full support included",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30 relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            The Solution
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            AI That Actually <span className="text-gradient-accent">Works</span> For You
          </h2>
          <p className="text-lg text-muted-foreground">
            We don't sell you software and disappear. We build custom solutions that integrate seamlessly into your business and deliver measurable ROI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const CardContent = (
              <>
                <div className={`p-3 rounded-xl inline-block mb-4 transition-colors ${
                  service.featured 
                    ? "bg-accent/10 text-accent group-hover:bg-accent/20" 
                    : "bg-primary/10 text-primary group-hover:bg-primary/20"
                }`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <p className={`font-semibold text-sm ${service.featured ? "text-accent" : "text-accent"}`}>
                  {service.highlight}
                </p>
                {service.link && (
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Explore BOS <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </>
            );

            if (service.link) {
              return (
                <Link
                  key={index}
                  to={service.link}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`card-elevated p-6 group transition-all duration-500 block ${
                    service.featured 
                      ? "border-accent/30 hover:border-accent/50 hover:glow-accent ring-1 ring-accent/20" 
                      : "hover:border-primary/30 hover:glow-primary"
                  }`}
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={index}
                className="card-elevated p-6 group hover:border-primary/30 hover:glow-primary transition-all duration-500"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
