import { CheckCircle2 } from "lucide-react";

const credentials = [
  "10+ years in software development & automation",
  "Helped 50+ businesses implement AI solutions",
  "Former tech lead at Fortune 500 company",
  "Passionate about making AI accessible to all",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
              {/* Placeholder for founder photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                    <span className="text-4xl font-display font-bold text-primary">JD</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Replace with founder photo</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/10 rounded-2xl -z-10" />
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Meet the Founder
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              Hi, I'm{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Zach</span>
            </h2>

            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              <p>
                I started this journey because I saw too many small business owners drowning in repetitive
                tasks—spending hours on work that could be automated in seconds.
              </p>
              <p>
                After a decade in tech, building systems for enterprise companies, I realized the same powerful AI tools
                should be available to everyone, not just corporations with massive budgets.
              </p>
              <p>
                <span className="text-foreground font-medium">My mission is simple:</span> help business owners reclaim
                their time so they can focus on what they do best—growing their business and serving their customers.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {credentials.map((credential, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{credential}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 bg-muted/50 rounded-xl border border-border/50">
              <p className="italic text-muted-foreground">
                "I believe every business deserves access to the same AI advantages that big companies have. Let me show
                you what's possible."
              </p>
              <p className="mt-3 font-semibold text-foreground">— [Your Name], Founder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
