import { Package, TrendingDown, DollarSign, BarChart3, AlertTriangle, CheckCircle, ArrowDown, ArrowUp, Truck, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PremierPaintPreview = () => {
  const inventoryData = [
    { name: "Sherwin-Williams ProMar 200", sku: "SW-PM200-WHT", stock: 245, max: 300, location: "A-12", status: "optimal" },
    { name: "Benjamin Moore Regal Select", sku: "BM-RS-INT-01", stock: 89, max: 150, location: "B-04", status: "low" },
    { name: "PPG Diamond Interior", sku: "PPG-DI-EGG", stock: 156, max: 200, location: "A-08", status: "optimal" },
    { name: "Behr Premium Plus", sku: "BHR-PP-SAT", stock: 12, max: 100, location: "C-15", status: "critical" },
  ];

  const warehouseZones = [
    { zone: "A", name: "Interior Paints", utilization: 87, capacity: "2,400 gal" },
    { zone: "B", name: "Exterior Paints", utilization: 62, capacity: "1,800 gal" },
    { zone: "C", name: "Specialty Coatings", utilization: 45, capacity: "900 gal" },
    { zone: "D", name: "Primers & Sealers", utilization: 78, capacity: "1,200 gal" },
  ];

  const incomingDeliveries = [
    { supplier: "Sherwin-Williams", items: 48, eta: "Today, 2:30 PM", status: "in-transit" },
    { supplier: "Benjamin Moore", items: 24, eta: "Tomorrow, 9:00 AM", status: "scheduled" },
    { supplier: "PPG Industries", items: 36, eta: "Jan 15, 10:30 AM", status: "scheduled" },
  ];

  return (
    <div className="bg-slate-950 text-white p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Premier Paint Inventory</h2>
          <p className="text-slate-400 text-sm">Real-time warehouse management</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Mock Data
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> 80%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">$12.4K</p>
            <p className="text-xs text-slate-400">Waste Reduction YoY</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> 20%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">2,847</p>
            <p className="text-xs text-slate-400">Units On Hand</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> 15%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">$284K</p>
            <p className="text-xs text-slate-400">Inventory Value</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-emerald-400">98.2%</span>
            </div>
            <p className="text-2xl font-bold text-white">98.2%</p>
            <p className="text-xs text-slate-400">Fill Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Warehouse Utilization */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <CardTitle className="text-sm font-medium text-slate-300">Warehouse Utilization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouseZones.map((zone, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                      {zone.zone}
                    </span>
                    <span className="text-white">{zone.name}</span>
                  </div>
                  <span className="text-slate-400">{zone.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        zone.utilization > 80 ? 'bg-amber-500' : 
                        zone.utilization > 60 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${zone.utilization}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{zone.utilization}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Incoming Deliveries */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium text-slate-300">Incoming Deliveries</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingDeliveries.map((delivery, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">{delivery.supplier}</p>
                  <p className="text-xs text-slate-400">{delivery.items} units • {delivery.eta}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  delivery.status === 'in-transit' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                }`}>
                  {delivery.status === 'in-transit' ? 'In Transit' : 'Scheduled'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Inventory Levels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left p-3 font-medium">Stock Level</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3">
                      <p className="font-medium text-white text-xs md:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </td>
                    <td className="p-3 text-slate-400 hidden md:table-cell">{item.location}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(item.stock / item.max) * 100} 
                          className="h-2 w-16 bg-slate-800"
                        />
                        <span className="text-xs text-slate-400">{item.stock}/{item.max}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {item.status === "optimal" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Optimal
                        </span>
                      )}
                      {item.status === "low" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      )}
                      {item.status === "critical" && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle className="w-3 h-3" /> Critical
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremierPaintPreview;