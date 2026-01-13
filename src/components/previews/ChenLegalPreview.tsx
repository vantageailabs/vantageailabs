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
    <div className="bg-slate-950 text-white p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Chen Legal Billing</h2>
          <p className="text-slate-400 text-sm">Automated invoicing & follow-up system</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          25 hrs/week saved
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">$128K</p>
            <p className="text-xs text-slate-400">Collected This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400">+12%</span>
            </div>
            <p className="text-2xl font-bold text-white">142</p>
            <p className="text-xs text-slate-400">Invoices Generated</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-emerald-400">-3 days</span>
            </div>
            <p className="text-2xl font-bold text-white">4.2</p>
            <p className="text-xs text-slate-400">Avg Days to Payment</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-emerald-400">Auto</span>
            </div>
            <p className="text-2xl font-bold text-white">89</p>
            <p className="text-xs text-slate-400">Follow-ups Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Activity */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Automation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {automationStats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-slate-800/50">
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{stat.period}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left p-3 font-medium">Client / Matter</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3">
                      <p className="font-medium text-white text-xs md:text-sm">{invoice.client}</p>
                      <p className="text-xs text-slate-500">{invoice.matter}</p>
                    </td>
                    <td className="p-3 text-slate-300 hidden md:table-cell">${invoice.amount.toLocaleString()}</td>
                    <td className="p-3">
                      {invoice.status === "paid" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {invoice.status === "sent" && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                          <Send className="w-3 h-3" /> Sent
                        </span>
                      )}
                      {invoice.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {invoice.status === "draft" && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-400/10 px-2 py-1 rounded-full">
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
