import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export interface ClientCost {
  id: string;
  name: string;
  amount: number;
  notes?: string;
  incurred_at: string;
}

interface Props {
  costs: ClientCost[];
  onCostsChange: (costs: ClientCost[]) => void;
}

export function ClientCostsSection({ costs, onCostsChange }: Props) {
  const handleAddCost = () => {
    onCostsChange([
      ...costs,
      {
        id: `temp-${Date.now()}`,
        name: '',
        amount: 0,
        incurred_at: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveCost = (index: number) => {
    onCostsChange(costs.filter((_, i) => i !== index));
  };

  const handleCostChange = (index: number, field: keyof ClientCost, value: string | number) => {
    const updated = [...costs];
    updated[index] = { ...updated[index], [field]: value };
    onCostsChange(updated);
  };

  const calculateTotalCosts = () => {
    return costs.reduce((sum, c) => sum + Number(c.amount), 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Costs</Label>
        <Button variant="outline" size="sm" onClick={handleAddCost}>
          <Plus className="h-4 w-4 mr-1" />
          Add Cost
        </Button>
      </div>

      {costs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No costs tracked yet.</p>
      ) : (
        <div className="space-y-2">
          {costs.map((cost, index) => (
            <div key={cost.id} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-muted/50">
              <Input
                className="flex-1"
                value={cost.name}
                onChange={(e) => handleCostChange(index, 'name', e.target.value)}
                placeholder="Cost name (e.g., Lovable credits)"
              />
              <Input
                type="number"
                className="w-28"
                value={cost.amount}
                onChange={(e) => handleCostChange(index, 'amount', Number(e.target.value))}
                placeholder="Amount"
              />
              <Input
                type="date"
                className="w-36"
                value={cost.incurred_at}
                onChange={(e) => handleCostChange(index, 'incurred_at', e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => handleRemoveCost(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex justify-end text-sm text-muted-foreground">
            Total Costs: <span className="font-medium text-destructive ml-1">${calculateTotalCosts().toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
