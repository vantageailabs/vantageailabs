import { Bot, Workflow, Rocket, Shield, Sparkles, Target } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "Custom AI Assistants",
    description: "Chatbots and virtual assistants that handle customer inquiries, bookings, and support 24/7.",
    highlight: "Never miss a lead again",
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
    title: "Website + Business Coaching",
    description: "Full website build plus hands-on guidance—funnels, client management, automated emails, and strategy.",
    highlight: "Done-for-you + taught",
  },
  {
    icon: Rocket,
    title: "Implementation & Training",
    description: "We don't just build—we train your team and ensure everything runs smoothly.",
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
          {services.map((service, index) => (
            <div
              key={index}
              className="card-elevated p-6 group hover:border-primary/30 hover:glow-primary transition-all duration-500"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
              <p className="text-accent font-semibold text-sm">{service.highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
