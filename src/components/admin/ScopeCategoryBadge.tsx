import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ScopeCategory = 'maintenance' | 'content_update' | 'new_page' | 'enhancement' | 'integration' | 'new_project';

interface Props {
  category: ScopeCategory;
  showTooltip?: boolean;
}

const scopeInfo: Record<ScopeCategory, { label: string; supportEligible: boolean; description: string }> = {
  maintenance: {
    label: 'Maintenance',
    supportEligible: true,
    description: 'Bug fixes, security updates, performance optimization',
  },
  content_update: {
    label: 'Content Update',
    supportEligible: true,
    description: 'Text changes, image swaps, contact info updates',
  },
  new_page: {
    label: 'New Page',
    supportEligible: true,
    description: 'Additional pages using existing templates/functionality',
  },
  enhancement: {
    label: 'Enhancement',
    supportEligible: false,
    description: 'New features on existing pages (forms, galleries, etc.)',
  },
  integration: {
    label: 'Integration',
    supportEligible: false,
    description: 'New third-party connections (booking, CRM, payments)',
  },
  new_project: {
    label: 'New Project',
    supportEligible: false,
    description: 'New website, app, or major system build',
  },
};

export function ScopeCategoryBadge({ category, showTooltip = true }: Props) {
  const info = scopeInfo[category];
  const isEligible = info.supportEligible;

  const badge = (
    <Badge
      variant="outline"
      className={`gap-1 ${
        isEligible
          ? 'bg-green-500/10 text-green-600 border-green-500/30'
          : 'bg-orange-500/10 text-orange-600 border-orange-500/30'
      }`}
    >
      {isEligible ? (
        <Check className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {info.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium mb-1">
            {isEligible ? '✓ Support Eligible' : '✗ Requires Separate Quote'}
          </p>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function getScopeCategories() {
  return Object.entries(scopeInfo).map(([key, value]) => ({
    value: key as ScopeCategory,
    label: value.label,
    supportEligible: value.supportEligible,
    description: value.description,
  }));
}
