import { Users, Zap, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Elevation180Preview = () => {
  const teamMembers = [
    { name: "Sarah Mitchell", role: "VP of Operations", score: "A+", energy: 97, color: "from-emerald-500 to-emerald-400" },
    { name: "David Park", role: "Head of Product", score: "A", energy: 92, color: "from-emerald-500 to-emerald-400" },
    { name: "Rachel Torres", role: "Director of Sales", score: "B+", energy: 87, color: "from-blue-500 to-blue-400" },
    { name: "Michael Chen", role: "Engineering Lead", score: "A-", energy: 89, color: "from-emerald-500 to-emerald-400" },
    { name: "Jennifer Walsh", role: "CFO", score: "B", energy: 82, color: "from-blue-500 to-blue-400" },
    { name: "Marcus Johnson", role: "HR Director", score: "C+", energy: 76, color: "from-amber-500 to-amber-400" },
  ];

  const getScoreColor = (score: string) => {
    if (score.startsWith("A")) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score.startsWith("B")) return "text-blue-600 border-blue-200 bg-blue-50";
    if (score.startsWith("C")) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  const getScoreBarColor = (score: string) => {
    if (score.startsWith("A")) return "bg-emerald-500";
    if (score.startsWith("B")) return "bg-blue-500";
    if (score.startsWith("C")) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white text-slate-900 p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Energy 180</h2>
            <p className="text-slate-600 text-xs font-medium">Executive Performance Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Mock Data
        </div>
      </div>

      {/* Task Input Section */}
      <Card className="bg-slate-50 border-slate-200 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Describe your task..."
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 pl-10 h-11 focus-visible:ring-violet-500"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0 h-11 px-5 font-semibold shadow-md">
                TrueFit
              </Button>
              <Button variant="outline" className="bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 h-11 px-5 font-semibold">
                HeadHunter
              </Button>
              <Button variant="outline" className="bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 h-11 px-5 font-semibold">
                360
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900">Executive Team</h3>
          <span className="text-xs text-slate-600 font-medium">6 members</span>
        </div>
        <div className="text-xs text-slate-700 font-medium">
          Team Average: <span className="text-violet-700 font-bold">B+ (87.2)</span>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {teamMembers.map((member, i) => (
          <Card key={i} className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-800 border-2 border-violet-200">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`px-2.5 py-1 rounded-lg border-2 text-sm font-bold ${getScoreColor(member.score)}`}>
                  {member.score}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                <p className="text-xs text-slate-600 font-medium truncate">{member.role}</p>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Energy Score</span>
                  <span className="text-slate-900 font-bold">{member.energy}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreBarColor(member.score)}`}
                    style={{ width: `${member.energy}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-700 font-medium border-t border-slate-200 pt-4">
        <span>Last assessment: 3 days ago</span>
        <span>Next scheduled: Jan 20, 2026</span>
      </div>
    </div>
  );
};

export default Elevation180Preview;