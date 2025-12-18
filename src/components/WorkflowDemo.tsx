import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus, ArrowRight, Zap, Mail, Database, MessageSquare, FileText, Calendar } from "lucide-react";

const availableNodes = [
  { id: "trigger", icon: Zap, label: "Trigger", description: "New lead arrives" },
  { id: "email", icon: Mail, label: "Send Email", description: "Welcome sequence" },
  { id: "crm", icon: Database, label: "Update CRM", description: "Add to pipeline" },
  { id: "ai", icon: MessageSquare, label: "AI Response", description: "Personalized reply" },
  { id: "document", icon: FileText, label: "Generate Doc", description: "Create proposal" },
  { id: "schedule", icon: Calendar, label: "Schedule Call", description: "Book meeting" },
];

const WorkflowDemo = () => {
  const [activeNodes, setActiveNodes] = useState<string[]>(["trigger"]);
  const [isRunning, setIsRunning] = useState(false);

  const addNode = (nodeId: string) => {
    if (!activeNodes.includes(nodeId)) {
      setActiveNodes([...activeNodes, nodeId]);
    }
  };

  const runWorkflow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const resetWorkflow = () => {
    setActiveNodes(["trigger"]);
  };

  return (
    <section id="workflow-demo" className="py-20 md:py-32 bg-background relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            Interactive Demo
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Build Your First <span className="text-gradient-primary">AI Workflow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how easy it is to automate your business. Click the blocks below to build a lead nurturing workflow.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Workflow Canvas */}
          <div className="card-elevated p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">Your Workflow</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetWorkflow}>
                  Reset
                </Button>
                <Button 
                  variant="hero" 
                  size="sm" 
                  onClick={runWorkflow}
                  disabled={isRunning}
                >
                  {isRunning ? "Running..." : "Test Workflow"}
                </Button>
              </div>
            </div>

            {/* Active workflow visualization */}
            <div className="flex flex-wrap items-center gap-4 min-h-[100px] p-4 rounded-xl bg-muted/50 border border-border/50">
              {activeNodes.map((nodeId, index) => {
                const node = availableNodes.find(n => n.id === nodeId);
                if (!node) return null;
                
                return (
                  <div key={nodeId} className="flex items-center gap-4">
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-card border-2 transition-all duration-300 ${
                        isRunning ? 'border-primary animate-pulse-glow' : 'border-border'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <node.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{node.label}</p>
                        <p className="text-xs text-muted-foreground">{node.description}</p>
                      </div>
                      {isRunning && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {index < activeNodes.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
              
              {activeNodes.length < availableNodes.length && (
                <div className="flex items-center gap-4">
                  {activeNodes.length > 0 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add step below</span>
                  </div>
                </div>
              )}
            </div>

            {/* Results preview */}
            {isRunning && (
              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 font-semibold text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Workflow executed successfully! Lead processed in 0.3 seconds.
                </p>
              </div>
            )}
          </div>

          {/* Available blocks */}
          <div className="card-elevated p-8">
            <h3 className="font-display font-semibold text-lg mb-4">Available Automation Blocks</h3>
            <p className="text-muted-foreground text-sm mb-6">Click to add to your workflow</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableNodes.filter(n => !activeNodes.includes(n.id)).map((node) => (
                <button
                  key={node.id}
                  onClick={() => addNode(node.id)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 text-left group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <node.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{node.label}</p>
                    <p className="text-xs text-muted-foreground">{node.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {activeNodes.length === availableNodes.length && (
              <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-accent font-semibold text-sm">
                  🎉 Amazing! You've built a complete lead nurturing workflow. Imagine this running 24/7 for your business.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowDemo;
