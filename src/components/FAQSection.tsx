import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to implement AI automation?",
    answer: "Most projects take 2-4 weeks from discovery to deployment. Simple automations can be live within days, while more complex integrations may take 6-8 weeks. We'll provide a detailed timeline during your free consultation."
  },
  {
    question: "What's the typical investment for AI automation?",
    answer: "Projects typically range from $2,500 to $15,000 depending on complexity. However, most clients see ROI within 30-60 days through time savings and increased efficiency. We offer flexible payment plans and always start with a free consultation to understand your needs."
  },
  {
    question: "Do I need technical expertise to use the AI tools you build?",
    answer: "Absolutely not. We design everything to be user-friendly and intuitive. Plus, we provide complete training for your team and ongoing support to ensure you get the most out of your automation."
  },
  {
    question: "What if AI automation doesn't work for my business?",
    answer: "During our discovery call, we'll honestly assess if AI is right for your situation. We only take on projects where we're confident we can deliver results. If automation isn't the right fit, we'll tell you upfront—no hard sell."
  },
  {
    question: "Will AI replace my employees?",
    answer: "Our goal is to augment your team, not replace them. AI handles repetitive, time-consuming tasks so your people can focus on high-value work that requires human creativity, empathy, and judgment. Most clients find their team becomes more productive and satisfied."
  },
  {
    question: "What tools and platforms do you integrate with?",
    answer: "We work with most popular business tools including CRMs (HubSpot, Salesforce), communication platforms (Slack, Teams), email providers, scheduling tools, and more. If you use it, we can likely automate it."
  },
  {
    question: "How do you ensure data security and privacy?",
    answer: "Security is paramount. We follow industry best practices, use encrypted connections, and ensure all AI implementations comply with relevant data protection regulations. Your data stays yours—we never use client data to train models."
  },
  {
    question: "What kind of support do you provide after launch?",
    answer: "We provide 30 days of included support with every project. After that, we offer ongoing optimization packages to keep your automations running smoothly and evolving with your business needs."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about working with us and implementing AI in your business.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="#booking" className="text-primary font-medium hover:underline">
              Book a free consultation
            </a>{" "}
            and we'll answer everything.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
