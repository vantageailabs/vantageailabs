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
    if (score.startsWith("A")) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (score.startsWith("B")) return "text-blue-400 border-blue-400/30 bg-blue-400/10";
    if (score.startsWith("C")) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    return "text-red-400 border-red-400/30 bg-red-400/10";
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Energy 180</h2>
            <p className="text-indigo-300/70 text-xs">Executive Performance Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-full border border-indigo-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Mock Data
        </div>
      </div>

      {/* Task Input Section */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
              <Input 
                placeholder="Describe your task..."
                className="bg-white/5 border-white/10 text-white placeholder:text-indigo-300/40 pl-10 h-11 focus-visible:ring-indigo-500/50"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 h-11 px-5 font-medium">
                TrueFit
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-11 px-5 font-medium">
                HeadHunter
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-11 px-5 font-medium">
                360
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Executive Team</h3>
          <span className="text-xs text-indigo-300/50">6 members</span>
        </div>
        <div className="text-xs text-indigo-300/70">
          Team Average: <span className="text-indigo-300 font-semibold">B+ (87.2)</span>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {teamMembers.map((member, i) => (
          <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-sm font-semibold text-white border border-white/10">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-sm font-bold ${getScoreColor(member.score)}`}>
                  {member.score}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <p className="text-xs text-indigo-300/60 truncate">{member.role}</p>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-300/50">Energy Score</span>
                  <span className="text-white font-medium">{member.energy}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${member.color}`}
                    style={{ width: `${member.energy}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-xs text-indigo-300/50 border-t border-white/10 pt-4">
        <span>Last assessment: 3 days ago</span>
        <span>Next scheduled: Jan 20, 2026</span>
      </div>
    </div>
  );
};

export default Elevation180Preview;