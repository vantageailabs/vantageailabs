import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

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
          <Logo />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vantage AI Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
