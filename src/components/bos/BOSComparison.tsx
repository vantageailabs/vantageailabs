import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonRow {
  feature: string;
  traditional: boolean | string;
  vantage: boolean | string;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Lead Capture",
    traditional: "Passive (Wait for Submit)",
    vantage: "Active (Captures partials)"
  },
  {
    feature: "Follow-up",
    traditional: "Manual (You have to call)",
    vantage: "Automated (SMS/Email loops)"
  },
  {
    feature: "Organization",
    traditional: "Fragmented Emails",
    vantage: "Centralized Dashboard"
  },
  {
    feature: "Speed-to-Lead",
    traditional: "Hours or Days",
    vantage: "Under 30 Seconds"
  },
  {
    feature: "Review Requests",
    traditional: "Manual (If you remember)",
    vantage: "Automatic (Post-job trigger)"
  },
  {
    feature: "Business Impact",
    traditional: "A cost center",
    vantage: "A revenue generator"
  }
];

const BOSComparison = () => {
  const renderValue = (value: boolean | string, isVantage: boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className={cn("h-5 w-5", isVantage ? "text-primary" : "text-muted-foreground")} />
      ) : (
        <X className="h-5 w-5 text-destructive" />
      );
    }
    return (
      <span className={cn(
        "text-sm",
        isVantage ? "text-foreground font-medium" : "text-muted-foreground"
      )}>
        {value}
      </span>
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why a "BOS" and Not a <span className="text-primary">"Website"?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A website sits there. A Business Operating System works for you 24/7.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50">
            <div className="p-4 font-semibold text-sm">Feature</div>
            <div className="p-4 font-semibold text-sm text-center border-l border-border">
              Traditional Website
            </div>
            <div className="p-4 font-semibold text-sm text-center border-l border-primary/30 bg-primary/5">
              <span className="text-primary">Vantage BOS</span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div 
              key={row.feature}
              className={cn(
                "grid grid-cols-3",
                index % 2 === 0 ? "bg-card" : "bg-card/50"
              )}
            >
              <div className="p-4 text-sm font-medium border-t border-border">
                {row.feature}
              </div>
              <div className="p-4 text-center border-t border-l border-border flex items-center justify-center">
                {renderValue(row.traditional, false)}
              </div>
              <div className="p-4 text-center border-t border-l border-primary/30 bg-primary/5 flex items-center justify-center">
                {renderValue(row.vantage, true)}
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <blockquote className="text-lg italic text-muted-foreground">
            "We don't just hand you a login and walk away. We research your offline workflow, identify where your team is bogged down, and build the software to take those tasks off their plate."
          </blockquote>
          <p className="mt-4 text-sm text-primary font-medium">— The Vantage Promise</p>
        </div>
      </div>
    </section>
  );
};

export default BOSComparison;
