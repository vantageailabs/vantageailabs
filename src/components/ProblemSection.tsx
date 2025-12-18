import { AlertTriangle, TrendingDown, Clock, Users } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Drowning in Repetitive Tasks",
    description: "Your team spends 60% of their time on tasks a machine could do in seconds.",
  },
  {
    icon: TrendingDown,
    title: "Competitors Are Pulling Ahead",
    description: "While you're stuck in spreadsheets, your competition is automating and scaling.",
  },
  {
    icon: Users,
    title: "Can't Scale Without Breaking",
    description: "Every new client means more chaos. Your processes don't scale—they crumble.",
  },
  {
    icon: AlertTriangle,
    title: "AI Overwhelm Is Real",
    description: "You know AI can help, but where do you even start? The noise is deafening.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent font-semibold uppercase tracking-wider text-sm mb-4">
            The Problem
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            You're Working <span className="text-gradient-primary">Harder</span>, Not Smarter
          </h2>
          <p className="text-lg text-muted-foreground">
            Sound familiar? You're not alone. Most small businesses are bleeding time and money on problems that have already been solved.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="card-elevated p-6 group hover:border-destructive/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
