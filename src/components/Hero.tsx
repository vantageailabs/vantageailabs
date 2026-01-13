import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Play } from "lucide-react";
import premierPaintLogo from "@/assets/premier-paint-logo.png";
import elevation180Logo from "@/assets/elevation180-logo.png";
import bestBuyDrugsLogo from "@/assets/best-buy-drugs-logo.png";

const Hero = () => {
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAssessment = () => {
    document.getElementById('assessment')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Business Transformation</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Stop Leaving <span className="text-gradient-accent">$100K+</span> On The Table Every Year
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            We build custom AI solutions that automate your busywork, 
            <span className="text-foreground font-medium"> cut operational costs by 40%</span>, and free you to scale without hiring.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={scrollToBooking} className="group">
              Book Your Free Strategy Call
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl" onClick={scrollToAssessment} className="group">
              <Play className="w-5 h-5" />
              Take the Assessment
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 border-2 border-background" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-white">
                  <img src={bestBuyDrugsLogo} alt="Best Buy Drugs" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-white">
                  <img src={elevation180Logo} alt="Elevation180" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-white">
                  <img src={premierPaintLogo} alt="Premier Paint" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-sm">50+ Businesses Transformed</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="text-sm">
              <span className="text-accent font-semibold">$2.3M+</span> Saved For Clients
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="text-sm">
              <span className="text-primary font-semibold">14 Days</span> Average Implementation
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
