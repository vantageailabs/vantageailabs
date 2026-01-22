import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BOSModule {
  id: string;
  name: string;
  description: string;
  price: number;
  hoursSaved: number;
  valueMetric: string;
  icon: React.ElementType;
  tier: "foundation" | "lead-sales" | "customer" | "ai" | "operations" | "finance" | "analytics";
  included?: boolean; // If true, it's a base feature (no toggle)
}

interface BOSModuleCardProps {
  module: BOSModule;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const BOSModuleCard = ({ module, isSelected, onToggle, disabled }: BOSModuleCardProps) => {
  const Icon = module.icon;
  const isIncluded = module.included;

  return (
    <button
      onClick={onToggle}
      disabled={disabled || isIncluded}
      className={cn(
        "relative p-4 rounded-xl border text-left transition-all w-full",
        isSelected || isIncluded
          ? "bg-primary/10 border-primary"
          : "bg-card border-border hover:border-primary/50",
        (disabled || isIncluded) && "cursor-default opacity-80"
      )}
    >
      {/* Selection indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-colors",
        isSelected || isIncluded
          ? "bg-primary text-primary-foreground"
          : "bg-muted border border-border"
      )}>
        {(isSelected || isIncluded) ? (
          <Check className="h-3 w-3" />
        ) : (
          <Plus className="h-3 w-3 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-start gap-3 pr-8">
        <div className={cn(
          "p-2 rounded-lg",
          isSelected || isIncluded ? "bg-primary/20" : "bg-muted"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            isSelected || isIncluded ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{module.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {module.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary font-medium">
              {module.valueMetric}
            </span>
            {!isIncluded && (
              <span className="text-sm font-bold">
                +${module.price.toLocaleString()}
              </span>
            )}
            {isIncluded && (
              <span className="text-xs text-muted-foreground">Included</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default BOSModuleCard;
