import { FileText, Clock, DollarSign, Send, CheckCircle, AlertCircle, Timer, TrendingUp, Scale, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ChenLegalPreview = () => {
  const matters = [
    { client: "Johnson Estate", type: "Probate", status: "active", lastActivity: "Invoice sent", dueDate: "Jan 20", priority: "high" },
    { client: "TechStart Inc.", type: "IP Law", status: "active", lastActivity: "Follow-up scheduled", dueDate: "Jan 18", priority: "medium" },
    { client: "Roberts Trust", type: "Estate", status: "pending", lastActivity: "Awaiting payment", dueDate: "Jan 15", priority: "high" },
    { client: "Martinez Corp", type: "Contract", status: "active", lastActivity: "Documents received", dueDate: "Jan 22", priority: "low" },
  ];

  const recentActivity = [
    { action: "Invoice auto-sent", client: "Johnson Estate", amount: "$4,500", time: "2 min ago", icon: Send },
    { action: "Payment received", client: "Martinez Corp", amount: "$1,800", time: "1 hr ago", icon: CheckCircle },
    { action: "Reminder triggered", client: "Roberts Trust", amount: "$3,200", time: "3 hrs ago", icon: Clock },
    { action: "New matter created", client: "Williams Holdings", amount: "$2,100", time: "Yesterday", icon: FileText },
  ];

  return (
    <div className="bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 text-stone-900 p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-900">Chen Legal</h2>
            <p className="text-stone-500 text-xs">Billing Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            10 hrs/week saved
          </div>
          <div className="flex items-center gap-2 bg-stone-200 text-stone-600 text-xs px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Mock Data
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Collected</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">$128K</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% this month
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Invoices</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">142</p>
          <p className="text-xs text-stone-500 mt-1">Auto-generated</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Timer className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Payment</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">4.2d</p>
          <p className="text-xs text-emerald-600 mt-1">-3 days vs avg</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-xs font-medium">Follow-ups</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">89</p>
          <p className="text-xs text-stone-500 mt-1">Sent automatically</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Active Matters - Left Column */}
        <Card className="md:col-span-3 bg-white border-stone-200 shadow-sm">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-stone-900">Active Matters</h3>
              </div>
              <Badge variant="secondary" className="bg-stone-100 text-stone-600 text-xs">
                {matters.length} active
              </Badge>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100">
              {matters.map((matter, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      matter.priority === 'high' ? 'bg-red-500' :
                      matter.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{matter.client}</p>
                      <p className="text-xs text-stone-500">{matter.type} • {matter.lastActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Due {matter.dueDate}</span>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed - Right Column */}
        <Card className="md:col-span-2 bg-white border-stone-200 shadow-sm">
          <div className="p-4 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Activity
            </h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <activity.icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900">{activity.action}</p>
                    <p className="text-xs text-stone-500 truncate">{activity.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900">{activity.amount}</p>
                    <p className="text-xs text-stone-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChenLegalPreview;