import { useState } from "react";
import { Star, Quote, ExternalLink } from "lucide-react";
import premierPaintLogo from "@/assets/premier-paint-logo.png";
import elevation180Logo from "@/assets/elevation180-logo.png";
import chenLegalLogo from "@/assets/chen-legal-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PremierPaintPreview from "./previews/PremierPaintPreview";
import ChenLegalPreview from "./previews/ChenLegalPreview";
import Elevation180Preview from "./previews/Elevation180Preview";

const testimonials = [
  {
    quote: "We've been in business for over 30 years and spent years trying to bundle our proprietary work into a SaaS for passive income. Now over half our business comes from the platform that was built for us.",
    name: "Jerry",
    role: "Founder",
    company: "Elevation180",
    result: "50%+ revenue from SaaS",
    avatar: "JE",
    previewComponent: "elevation180",
  },
  {
    quote: "I was skeptical about AI automation. But they built a system that handles our entire invoicing and follow-up process. I've literally gotten 10 hours of my week back.",
    name: "Marcus Chen",
    role: "CEO",
    company: "Chen Legal Services",
    result: "10 hours saved weekly",
    avatar: "MC",
    previewComponent: "chenLegal",
  },
  {
    quote: "Our new inventory system has allowed us to better locate our inventory in the warehouse causing an 80% reduction in our waste budget, keep 20% less inventory on hand while still servicing customers at a high level, and has saved countless hours of headaches related to inventory.",
    name: "John",
    role: "Owner",
    company: "Premier Paint",
    result: "80% waste reduction",
    avatar: "JP",
    previewComponent: "premierPaint",
  },
];

const TestimonialsSection = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<typeof testimonials[0] | null>(null);

  const renderPreview = (previewComponent: string) => {
    switch (previewComponent) {
      case "premierPaint":
        return <PremierPaintPreview />;
      case "chenLegal":
        return <ChenLegalPreview />;
      case "elevation180":
        return <Elevation180Preview />;
      default:
        return null;
    }
  };

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/30 relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            Success Stories
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Real Results From <span className="text-gradient-accent">Real Businesses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't take our word for it. Here's what business owners say after working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              onClick={() => setSelectedTestimonial(testimonial)}
              className="card-elevated p-6 group hover:border-primary/30 transition-all duration-500 flex flex-col cursor-pointer"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-primary/30" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-foreground/90 text-sm leading-relaxed mb-6 flex-grow">
                "{testimonial.quote}"
              </p>

              {/* Result badge */}
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  {testimonial.result}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                {testimonial.avatar === "JP" ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-border">
                    <img src={premierPaintLogo} alt="Premier Paint" className="w-full h-full object-cover" />
                  </div>
                ) : testimonial.avatar === "JE" ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-border">
                    <img src={elevation180Logo} alt="Elevation180" className="w-full h-full object-cover" />
                  </div>
                ) : testimonial.avatar === "MC" ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-border">
                    <img src={chenLegalLogo} alt="Chen Legal Services" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
                {/* View Preview hint */}
                <div className="flex items-center gap-1 text-primary/60 group-hover:text-primary text-xs mt-2 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>View what we built</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 w-[95vw] sm:w-full">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">
              Built for {selectedTestimonial?.company}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedTestimonial && renderPreview(selectedTestimonial.previewComponent)}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TestimonialsSection;
