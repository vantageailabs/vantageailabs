import { useState } from "react";
import { Globe, Brain, Plug, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  description: string;
  features: string[];
}

const phases: Phase[] = [
  {
    id: "frontend",
    number: 1,
    title: "The Intelligent Front-End",
    subtitle: "The Digital Identity",
    icon: Globe,
    description: "Your 24/7 high-converting salesman that never takes a day off.",
    features: [
      "Conversion-First Design: Mobile-native interface built to load in under 1 second",
      "Smart Intake Funnel: Dynamic forms that ask the right questions (emergency vs. routine, photo uploads)",
      "The Trust Builder: Real-time review syndication and automated project galleries"
    ]
  },
  {
    id: "logic",
    number: 2,
    title: "The Logic Engine",
    subtitle: "Lead Bucketing & Scoring",
    icon: Brain,
    description: "Automated sorting so you only talk to the best customers.",
    features: [
      "Automated Categorization: Tags leads by service type (Emergency, Installation, Maintenance) and budget",
      "Instant Lead Recovery: Captures partial emails and sends \"Did you forget something?\" follow-ups",
      "Priority Alerts: Urgent leads pushed via SMS, low-priority enters 7-day nurture sequence"
    ]
  },
  {
    id: "bridge",
    number: 3,
    title: "The Operational Bridge",
    subtitle: "Managing the \"Offline\"",
    icon: Plug,
    description: "Fixing the breakdown point where leads go to die.",
    features: [
      "Unified Lead Dashboard: One central hub to see every lead's status—no more sticky notes",
      "Automated Scheduling: Connect to Jobber, Housecall Pro, or use our native booking tool",
      "Pre-Job Automation: \"What to expect\" emails and text reminders before technician arrives"
    ]
  },
  {
    id: "leverage",
    number: 4,
    title: "The Leverage Layer",
    subtitle: "Scaling & Insights",
    icon: TrendingUp,
    description: "Data that gives you the \"Vantage\" point.",
    features: [
      "Performance Dashboards: See exactly which ads are making you money vs. wasting it",
      "Self-Managing Systems: Automated follow-ups for reviews and referrals after job completion",
      "Growth Ready: Modular architecture for adding AI phone agents, automated invoicing, and more"
    ]
  }
];

const BOSPhases = () => {
  const [activePhase, setActivePhase] = useState<string>("frontend");
  const currentPhase = phases.find(p => p.id === activePhase)!;

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Four Phases. One <span className="text-primary">Unified System.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Vantage BOS isn't a collection of tools—it's an integrated engine designed to capture, convert, and retain customers automatically.
          </p>
        </div>

        {/* Phase selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {phases.map((phase) => {
            const Icon = phase.icon;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                  activePhase === phase.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <span className="text-sm font-bold">Phase {phase.number}</span>
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Active phase content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <currentPhase.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary font-medium mb-1">{currentPhase.subtitle}</p>
                <h3 className="text-2xl font-bold">{currentPhase.title}</h3>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8">
              {currentPhase.description}
            </p>

            <ul className="space-y-4">
              {currentPhase.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visual connector */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    activePhase === phase.id ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
                {index < phases.length - 1 && (
                  <div className="w-8 h-0.5 bg-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BOSPhases;
