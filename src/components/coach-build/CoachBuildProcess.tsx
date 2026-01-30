import { Brain, Hammer, Rocket, Users } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Strategy Deep-Dive",
    description: "We map your customer journey, identify friction points, and define your conversion funnel before touching any code."
  },
  {
    icon: Users,
    title: "Coaching Sessions",
    description: "1-on-1 sessions covering lead psychology, email best practices, automation loops, and how to think like a marketer."
  },
  {
    icon: Hammer,
    title: "Custom Build",
    description: "Your website, BOS, or app—built with everything we discussed baked in. No generic templates."
  },
  {
    icon: Rocket,
    title: "Launch & Optimize",
    description: "Go live with confidence. We review analytics together and iterate based on real data."
  }
];

const CoachBuildProcess = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The <span className="text-primary">Coach + Build</span> Process
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We don't just hand you a deliverable. We equip you with the knowledge to grow.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="bg-card border border-border rounded-2xl p-6 text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachBuildProcess;
