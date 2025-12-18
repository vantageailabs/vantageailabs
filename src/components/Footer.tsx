import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-20 bg-muted/30 border-t border-border">
      <div className="container px-4">
        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient-accent">10x</span> Your Business?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join 50+ small businesses who've already transformed their operations with AI.
          </p>
          <Button variant="hero" size="xl" onClick={scrollToBooking} className="group">
            Schedule Your Free Call Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Footer links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <div className="font-display font-bold text-xl">
            <span className="text-gradient-primary">AI</span>Leverage
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AILeverage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
