import { ArrowDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const CoachBuildHero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">For New & Refreshing Businesses</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Don't Just Build.
            <br />
            <span className="text-primary">Build Smarter.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Most businesses launch without understanding <span className="text-foreground font-semibold">funnels, lead psychology, or automation</span>. 
            Coach + Build gives you both—a custom build (website, BOS, or app) plus the business coaching to make it actually work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg"
              onClick={() => scrollToSection("coach-build-tiers")}
            >
              See the Packages
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg"
              onClick={() => scrollToSection("coach-build-builder")}
            >
              Design Your Package
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Perfect for</p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/60">
              <span className="text-sm">Startups</span>
              <span className="text-sm">Consultants</span>
              <span className="text-sm">Service Businesses</span>
              <span className="text-sm">E-Commerce</span>
              <span className="text-sm">Agencies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachBuildHero;
