import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We were drowning in customer inquiries. Within 2 weeks of implementing their AI chatbot, response times dropped from hours to seconds—and we're closing 40% more leads.",
    name: "Sarah Mitchell",
    role: "Founder",
    company: "Coastal Property Management",
    result: "40% more leads closed",
    avatar: "SM",
  },
  {
    quote: "I was skeptical about AI automation. But they built a system that handles our entire invoicing and follow-up process. I've literally gotten 25 hours of my week back.",
    name: "Marcus Chen",
    role: "CEO",
    company: "Chen Legal Services",
    result: "25 hours saved weekly",
    avatar: "MC",
  },
  {
    quote: "The ROI was insane. Their lead gen automation paid for itself in the first month. We went from 50 to 150+ qualified leads per month with the same team size.",
    name: "Jennifer Okafor",
    role: "Marketing Director",
    company: "GrowthPath Consulting",
    result: "3x lead generation",
    avatar: "JO",
  },
];

const TestimonialsSection = () => {
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
              className="card-elevated p-6 group hover:border-primary/30 transition-all duration-500 flex flex-col"
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
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
