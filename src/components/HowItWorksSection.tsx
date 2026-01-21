import { Phone, Lightbulb, Wrench, HeartHandshake } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Phone,
    title: "Discovery Call",
    description: "We learn about your business, pain points, and goals to understand exactly what you need.",
  },
  {
    number: 2,
    icon: Lightbulb,
    title: "Custom Strategy",
    description: "We design an AI solution tailored to your specific workflows and business objectives.",
  },
  {
    number: 3,
    icon: Wrench,
    title: "Build & Implement",
    description: "We build, test, and deploy your automation with minimal disruption to your operations.",
  },
  {
    number: 4,
    icon: HeartHandshake,
    title: "Ongoing Support",
    description: "We train your team and provide continued optimization to ensure lasting results.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            The Process
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            How We <span className="text-gradient-accent">Transform</span> Your Business
          </h2>
          <p className="text-lg text-muted-foreground">
            A proven 4-step process that takes you from overwhelmed to automated in weeks, not months.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                
                <div className="flex flex-col items-center text-center">
                  {/* Number circle */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:glow-primary transition-all duration-500">
                      <span className="font-display text-2xl font-bold text-primary">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground mb-4 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                    <step.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
