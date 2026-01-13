import { Users, TrendingUp, CreditCard, BarChart3, Play, CheckCircle, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Elevation180Preview = () => {
  const subscribers = [
    { name: "CrossFit Downtown", plan: "Enterprise", mrr: 299, status: "active", members: 450 },
    { name: "Fitness First LA", plan: "Pro", mrr: 149, status: "active", members: 180 },
    { name: "Iron Athletics", plan: "Pro", mrr: 149, status: "trial", members: 95 },
    { name: "Peak Performance", plan: "Enterprise", mrr: 299, status: "active", members: 320 },
    { name: "Urban Strength", plan: "Starter", mrr: 79, status: "active", members: 45 },
  ];

  const courses = [
    { title: "Olympic Lifting Fundamentals", views: 12400, completion: 78 },
    { title: "Advanced Mobility", views: 8200, completion: 65 },
    { title: "Nutrition for Athletes", views: 15600, completion: 82 },
  ];

  return (
    <div className="bg-slate-950 text-white p-6 rounded-lg min-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Elevation180 Platform</h2>
          <p className="text-slate-400 text-sm">SaaS Dashboard Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          50%+ Revenue from SaaS
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400">+18%</span>
            </div>
            <p className="text-2xl font-bold text-white">$48.2K</p>
            <p className="text-xs text-slate-400">Monthly Recurring</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-emerald-400">+24</span>
            </div>
            <p className="text-2xl font-bold text-white">342</p>
            <p className="text-xs text-slate-400">Active Subscribers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-blue-400">156 hrs</span>
            </div>
            <p className="text-2xl font-bold text-white">89</p>
            <p className="text-xs text-slate-400">Video Courses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-400">4.9/5</span>
            </div>
            <p className="text-2xl font-bold text-white">4.9</p>
            <p className="text-xs text-slate-400">Platform Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* MRR Growth Chart */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">MRR Growth (12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {[25, 30, 35, 38, 42, 45, 52, 58, 62, 68, 74, 82].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm transition-all"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-slate-500">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
            <span>Jan: $12,400 MRR</span>
            <span className="text-purple-400 font-medium">Now: $48,200 MRR (+289%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">{course.title}</span>
                  <span className="text-xs text-slate-400">{course.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={course.completion} className="h-2 flex-1 bg-slate-800" />
                  <span className="text-xs text-slate-400">{course.completion}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              {subscribers.slice(0, 4).map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800/30">
                  <div>
                    <p className="text-xs font-medium text-white">{sub.name}</p>
                    <p className="text-[10px] text-slate-500">{sub.members} members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400">${sub.mrr}/mo</p>
                    <span className={`text-[10px] ${sub.status === 'trial' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {sub.plan}
                    </span>
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

export default Elevation180Preview;
