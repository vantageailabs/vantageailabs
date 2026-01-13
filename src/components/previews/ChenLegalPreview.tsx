import { FileText, Clock, DollarSign, Send, CheckCircle, AlertCircle, Timer, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ChenLegalPreview = () => {
  const invoices = [
    { client: "Johnson Estate", matter: "Probate Filing", amount: 4500, status: "paid", daysAgo: 2 },
    { client: "TechStart Inc.", matter: "IP Registration", amount: 2800, status: "sent", daysAgo: 5 },
    { client: "Roberts Family Trust", matter: "Trust Amendment", amount: 3200, status: "overdue", daysAgo: 14 },
    { client: "Martinez Corp", matter: "Contract Review", amount: 1800, status: "paid", daysAgo: 1 },
    { client: "Williams Holdings", matter: "LLC Formation", amount: 2100, status: "draft", daysAgo: 0 },
  ];

  const automationStats = [
    { label: "Invoices Auto-Generated", value: 142, period: "This Month" },
    { label: "Follow-ups Sent", value: 89, period: "This Month" },
    { label: "Payment Reminders", value: 34, period: "This Month" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-stone-900 to-neutral-900 text-white p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Chen Legal Billing</h2>
            <p className="text-stone-400 text-xs">Automated invoicing & follow-up</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full border border-amber-500/30">
            <Clock className="w-3 h-3" />
            10 hrs/week saved
          </div>
          <div className="flex items-center gap-2 bg-stone-800 text-stone-400 text-xs px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Mock Data
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">$128K</p>
            <p className="text-xs text-stone-400">Collected This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-emerald-400">+12%</span>
            </div>
            <p className="text-2xl font-bold text-white">142</p>
            <p className="text-xs text-stone-400">Invoices Generated</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-emerald-400">-3 days</span>
            </div>
            <p className="text-2xl font-bold text-white">4.2</p>
            <p className="text-xs text-stone-400">Avg Days to Payment</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-emerald-400">Auto</span>
            </div>
            <p className="text-2xl font-bold text-white">89</p>
            <p className="text-xs text-stone-400">Follow-ups Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Activity */}
      <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-stone-300">Automation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {automationStats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-amber-900/20 border border-amber-700/20">
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-stone-400">{stat.label}</p>
                <p className="text-[10px] text-stone-500 mt-1">{stat.period}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="bg-white/5 border-stone-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-stone-300">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700/50 text-stone-400">
                  <th className="text-left p-3 font-medium">Client / Matter</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => (
                  <tr key={i} className="border-b border-stone-800/50 hover:bg-white/5">
                    <td className="p-3">
                      <p className="font-medium text-white text-xs md:text-sm">{invoice.client}</p>
                      <p className="text-xs text-stone-500">{invoice.matter}</p>
                    </td>
                    <td className="p-3 text-stone-300 hidden md:table-cell">${invoice.amount.toLocaleString()}</td>
                    <td className="p-3">
                      {invoice.status === "paid" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {invoice.status === "sent" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                          <Send className="w-3 h-3" /> Sent
                        </span>
                      )}
                      {invoice.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {invoice.status === "draft" && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-400 bg-stone-400/10 px-2 py-1 rounded-full">
                          <FileText className="w-3 h-3" /> Draft
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

export default ChenLegalPreview;
