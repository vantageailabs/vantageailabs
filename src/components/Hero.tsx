import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Play, Shield, CheckCircle, Clock, Headphones } from "lucide-react";
import premierPaintLogo from "@/assets/premier-paint-logo.png";
import elevation180Logo from "@/assets/elevation180-logo.png";
import chenLegalLogo from "@/assets/chen-legal-logo.png";
import canyonClubLogo from "@/assets/canyon-club-logo.png";
import bestBuyDrugsLogo from "@/assets/best-buy-drugs-logo.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Hero = () => {
  const [guaranteeOpen, setGuaranteeOpen] = useState(false);

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAssessment = () => {
    document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
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
            Stop Leaving <span className="text-gradient-accent">Money</span> On The Table Every Year
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            We build custom AI solutions that automate your busywork,
            <span className="text-foreground font-medium"> cut operational costs by 40%</span>, and free you to scale
            without hiring.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button variant="hero" size="xl" onClick={scrollToBooking} className="group">
              Book Your Free Strategy Call
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl" onClick={scrollToAssessment} className="group">
              <Play className="w-5 h-5" />
              Take the Assessment
            </Button>
          </div>

          {/* Guarantee teaser */}
          <button
            onClick={() => setGuaranteeOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 animate-slide-up group"
            style={{ animationDelay: "0.3s" }}
          >
            <Shield className="w-4 h-4 text-accent" />
            <span>
              Backed by our <span className="text-accent font-medium">Risk-Free Guarantee</span>
            </span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Guarantee Dialog */}
          <Dialog open={guaranteeOpen} onOpenChange={setGuaranteeOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Shield className="w-6 h-6 text-accent" />
                  Our Risk-Free Guarantee
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h3 className="font-semibold text-lg text-accent mb-2">Results or Your Money Back</h3>
                  <p className="text-sm text-muted-foreground">
                    If you don't see measurable improvement in efficiency within 60 days of implementation, we'll refund
                    your investment in full—no questions asked.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">100% Satisfaction</p>
                      <p className="text-xs text-muted-foreground">Unlimited revisions until you're thrilled</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">On-Time Delivery</p>
                      <p className="text-xs text-muted-foreground">We meet deadlines or you don't pay</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Headphones className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">30-Day Support</p>
                      <p className="text-xs text-muted-foreground">Free post-launch support included</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm font-medium text-muted-foreground pt-2 border-t">
                  Zero risk. 100% peace of mind.
                </p>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    setGuaranteeOpen(false);
                    scrollToBooking();
                  }}
                >
                  Book Your Free Strategy Call
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Social proof */}
          <div
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  { src: premierPaintLogo, alt: "Premier Paint" },
                  { src: elevation180Logo, alt: "Elevation180" },
                  { src: chenLegalLogo, alt: "Chen Legal" },
                  { src: canyonClubLogo, alt: "Canyon Club" },
                  { src: bestBuyDrugsLogo, alt: "Best Buy Drugs" },
                ].map((logo, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-background overflow-hidden">
                    <img src={logo.src} alt={logo.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-sm">20+ Businesses Transformed</span>
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
