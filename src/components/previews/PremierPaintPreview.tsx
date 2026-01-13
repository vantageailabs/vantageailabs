import { Package, TrendingDown, DollarSign, BarChart3, AlertTriangle, CheckCircle, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PremierPaintPreview = () => {
  const inventoryData = [
    { name: "Sherwin-Williams ProMar 200", sku: "SW-PM200-WHT", stock: 245, max: 300, location: "A-12", status: "optimal" },
    { name: "Benjamin Moore Regal Select", sku: "BM-RS-INT-01", stock: 89, max: 150, location: "B-04", status: "low" },
    { name: "PPG Diamond Interior", sku: "PPG-DI-EGG", stock: 156, max: 200, location: "A-08", status: "optimal" },
    { name: "Behr Premium Plus", sku: "BHR-PP-SAT", stock: 12, max: 100, location: "C-15", status: "critical" },
    { name: "Dunn-Edwards Aristoshield", sku: "DE-AS-EXT", stock: 78, max: 120, location: "D-02", status: "optimal" },
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* Year over Year Chart Mockup */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Waste Budget: Year Over Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {[65, 58, 48, 42, 35, 28, 22, 18, 15, 13, 12, 11].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm transition-all"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-slate-500">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
            <span>Previous Year: $62,000</span>
            <span className="text-emerald-400 font-medium">Current Year: $12,400 (-80%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Live Inventory Levels</CardTitle>
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
