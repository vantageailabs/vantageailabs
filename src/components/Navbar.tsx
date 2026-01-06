import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-[48px] left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : ''
    }`}>
      <div className="container px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Logo linkToHome={false} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('workflow-demo')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('booking')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Book a Call
            </button>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Button variant="hero" onClick={() => scrollToSection('booking')}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('workflow-demo')} className="text-left py-2 text-muted-foreground hover:text-foreground">
                How It Works
              </button>
              <button onClick={() => scrollToSection('booking')} className="text-left py-2 text-muted-foreground hover:text-foreground">
                Book a Call
              </button>
              <Button variant="hero" onClick={() => scrollToSection('booking')} className="mt-2">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
