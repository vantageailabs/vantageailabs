import { Shield, CheckCircle2, Clock, HeartHandshake } from "lucide-react";

const guarantees = [
  {
    icon: Shield,
    title: "100% Satisfaction Guarantee",
    description: "If you're not completely satisfied with our work, we'll revise it until you are—or refund your investment. No questions asked."
  },
  {
    icon: Clock,
    title: "On-Time Delivery Promise",
    description: "We commit to agreed timelines. If we're late, you get a discount on your project. Your time matters."
  },
  {
    icon: HeartHandshake,
    title: "30-Day Support Included",
    description: "Every project includes 30 days of post-launch support. We're here to ensure everything runs smoothly."
  }
];

const GuaranteeSection = () => {
  return (
    <section id="guarantee" className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Risk-Free
            </span>{" "}
            Guarantee
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're confident in our work. That's why we back every project with guarantees 
            that put your mind at ease.
          </p>
        </div>

        {/* Main Guarantee Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative pt-10 md:pt-8 p-8 md:p-12 bg-card rounded-2xl border-2 border-primary/30 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 md:px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-xs md:text-sm whitespace-nowrap">
              Our Promise to You
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Results or Your Money Back
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                If within 60 days of implementation you don't see measurable improvements 
                in efficiency or time savings, we'll work with you to fix it at no extra cost. 
                If we can't deliver results, we'll refund your investment in full.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-primary font-medium">
                <CheckCircle2 className="w-5 h-5" />
                <span>Zero risk. 100% peace of mind.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Guarantees */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <guarantee.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{guarantee.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            "We only succeed when you succeed. That's not just a tagline—it's how we do business."
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
