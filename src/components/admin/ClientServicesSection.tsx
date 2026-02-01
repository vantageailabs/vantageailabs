import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Clock, Tag, FolderOpen } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { ScopeCategoryBadge, getScopeCategories, ScopeCategory } from './ScopeCategoryBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Service {
  id: string;
  name: string;
  base_price: number;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

interface ClientProject {
  id: string;
  name: string;
  domain?: string;
}

type ServiceStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface ClientService {
  id: string;
  service_id: string;
  agreed_price: number;
  status: ServiceStatus;
  start_date: string | null;
  end_date: string | null;
  coupon_id: string | null;
  project_id: string | null;
  scope_category: ScopeCategory;
  service?: Service;
  coupon?: Coupon;
}

interface Props {
  services: Service[];
  coupons: Coupon[];
  clientServices: ClientService[];
  clientProjects: ClientProject[];
  onServicesChange: (services: ClientService[]) => void;
}

export function ClientServicesSection({
  services,
  coupons,
  clientServices,
  clientProjects,
  onServicesChange,
}: Props) {
  const calculateDiscountedPrice = (cs: ClientService) => {
    if (!cs.coupon_id) return Number(cs.agreed_price);
    const coupon = coupons.find(c => c.id === cs.coupon_id) || cs.coupon;
    if (!coupon) return Number(cs.agreed_price);

    if (coupon.discount_type === 'percentage') {
      return Number(cs.agreed_price) * (1 - coupon.discount_value / 100);
    }
    return Math.max(0, Number(cs.agreed_price) - coupon.discount_value);
  };

  const handleAddService = () => {
    if (services.length === 0) return;
    onServicesChange([
      ...clientServices,
      {
        id: `temp-${Date.now()}`,
        service_id: services[0].id,
        agreed_price: services[0].base_price,
        status: 'planned' as ServiceStatus,
        start_date: null,
        end_date: null,
        coupon_id: null,
        project_id: clientProjects.length > 0 ? clientProjects[0].id : null,
        scope_category: 'new_project' as ScopeCategory,
        service: services[0],
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    onServicesChange(clientServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: string | number | null) => {
    const updated = [...clientServices];
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      updated[index] = {
        ...updated[index],
        service_id: value as string,
        agreed_price: service?.base_price || 0,
        service,
      };
    } else if (field === 'status') {
      updated[index] = { ...updated[index], status: value as ServiceStatus };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onServicesChange(updated);
  };

  const scopeCategories = getScopeCategories();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Assigned Services</Label>
        <Button variant="outline" size="sm" onClick={handleAddService} disabled={services.length === 0}>
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services available. Add services in the Services tab first.</p>
      ) : clientServices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {clientServices.map((cs, index) => {
            const duration = cs.start_date && cs.end_date
              ? differenceInDays(parseISO(cs.end_date), parseISO(cs.start_date)) + 1
              : null;
            const discountedPrice = calculateDiscountedPrice(cs);
            const hasDiscount = cs.coupon_id && discountedPrice !== Number(cs.agreed_price);
            const activeCoupon = cs.coupon_id ? (coupons.find(c => c.id === cs.coupon_id) || cs.coupon) : null;

            return (
              <div key={cs.id} className="p-3 rounded-lg border border-border/50 bg-muted/50 space-y-2">
                {/* Row 1: Service, Price, Status, Delete */}
                <div className="flex items-center gap-2">
                  <Select
                    value={cs.service_id}
                    onValueChange={(v) => handleServiceChange(index, 'service_id', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-28"
                    value={cs.agreed_price}
                    onChange={(e) => handleServiceChange(index, 'agreed_price', Number(e.target.value))}
                    placeholder="Price"
                  />
                  <Select
                    value={cs.status}
                    onValueChange={(v) => handleServiceChange(index, 'status', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Row 2: Project & Scope Category */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 flex-1">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      value={cs.project_id || 'none'}
                      onValueChange={(v) => handleServiceChange(index, 'project_id', v === 'none' ? null : v)}
                    >
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {clientProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name || 'Unnamed'} {p.domain && `(${p.domain})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Select
                    value={cs.scope_category}
                    onValueChange={(v) => handleServiceChange(index, 'scope_category', v)}
                  >
                    <SelectTrigger className="h-8 text-sm w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-1">
                            {cat.supportEligible ? '✓' : '✗'} {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ScopeCategoryBadge category={cs.scope_category} />
                </div>

                {/* Row 3: Dates and Duration */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="date"
                      className="h-8 text-sm"
                      value={cs.start_date || ''}
                      onChange={(e) => handleServiceChange(index, 'start_date', e.target.value || null)}
                      placeholder="Start"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                      type="date"
                      className="h-8 text-sm"
                      value={cs.end_date || ''}
                      onChange={(e) => handleServiceChange(index, 'end_date', e.target.value || null)}
                      placeholder="End"
                    />
                  </div>
                  {duration !== null && (
                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {duration} day{duration !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Row 4: Coupon and Final Price */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      value={cs.coupon_id || 'none'}
                      onValueChange={(v) => handleServiceChange(index, 'coupon_id', v === 'none' ? null : v)}
                    >
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="No coupon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No coupon</SelectItem>
                        {coupons.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.code} - {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`} off
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasDiscount && activeCoupon && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground line-through">${Number(cs.agreed_price).toFixed(0)}</span>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                        ${discountedPrice.toFixed(0)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
