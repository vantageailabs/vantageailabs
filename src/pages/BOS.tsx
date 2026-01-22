import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BOSHero from "@/components/bos/BOSHero";
import BOSPhases from "@/components/bos/BOSPhases";
import BOSTiers from "@/components/bos/BOSTiers";
import BOSComparison from "@/components/bos/BOSComparison";
import BOSBuilder from "@/components/bos/BOSBuilder";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const BOS = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button asChild size="sm">
            <Link to="/book">Book a Strategy Call</Link>
          </Button>
        </div>
      </header>

      {/* Page sections */}
      <BOSHero />
      <BOSPhases />
      <BOSTiers />
      <BOSComparison />
      <BOSBuilder />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to See Your Business as a <span className="text-primary">Well-Oiled Machine?</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss which BOS configuration is right for your team. No pressure, just clarity.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link to="/book">Book Your Strategy Session</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BOS;
