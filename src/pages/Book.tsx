import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import BookingSection from "@/components/BookingSection";
import vantageIcon from "@/assets/vantage-icon.png";

const Book = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book a Free AI Consultation"
        description="Schedule a free 30-minute consultation with Vantage AI Labs in Albuquerque. Discover how AI automation can transform your small business operations."
        canonical="/book"
        keywords="AI consultation Albuquerque, free business consultation, AI strategy session New Mexico"
      />
      {/* Simple Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={vantageIcon} alt="Vantage AI Labs" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">Vantage AI Labs</span>
          </Link>
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </header>

      {/* Booking Section */}
      <main>
        <BookingSection />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vantage AI Labs. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Book;
