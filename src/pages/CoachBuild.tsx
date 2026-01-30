import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CoachBuildHero from "@/components/coach-build/CoachBuildHero";
import CoachBuildTiers from "@/components/coach-build/CoachBuildTiers";
import CoachBuildProcess from "@/components/coach-build/CoachBuildProcess";
import CoachBuildBuilder from "@/components/coach-build/CoachBuildBuilder";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const CoachBuild = () => {
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
      <CoachBuildHero />
      <CoachBuildProcess />
      <CoachBuildTiers />
      <CoachBuildBuilder />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build <span className="text-primary">Smarter</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss your vision and create a roadmap that sets you up for long-term success.
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

export default CoachBuild;
