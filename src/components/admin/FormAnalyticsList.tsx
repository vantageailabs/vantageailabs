import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Mail, RefreshCw, TrendingDown, Users } from "lucide-react";

type FormStep = 'calendar' | 'form' | 'assessment' | 'completed' | 'lead_magnet' | 'contact' | 'bos_builder';

interface FormAnalyticsRow {
  id: string;
  session_id: string;
  current_step: string;
  step_started_at: string | null;
  time_on_step_seconds: number | null;
  fields_completed: string[] | null;
  last_field_focused: string | null;
  partial_email: string | null;
  partial_name: string | null;
  assessment_question_number: number | null;
  completed: boolean | null;
  abandoned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const stepLabels: Record<string, string> = {
  calendar: "Calendar Selection",
  form: "Form Details",
  assessment: "Assessment",
  completed: "Completed",
  lead_magnet: "Lead Magnet",
  contact: "Contact Form",
  bos_builder: "BOS Builder",
};

const stepColors: Record<string, string> = {
  calendar: "bg-blue-500/10 text-blue-500",
  form: "bg-purple-500/10 text-purple-500",
  assessment: "bg-orange-500/10 text-orange-500",
  completed: "bg-green-500/10 text-green-500",
  lead_magnet: "bg-cyan-500/10 text-cyan-500",
  contact: "bg-pink-500/10 text-pink-500",
  bos_builder: "bg-yellow-500/10 text-yellow-500",
};

export function FormAnalyticsList() {
  const [filter, setFilter] = useState<"all" | "abandoned" | "completed">("all");
  const [stepFilter, setStepFilter] = useState<string>("all");

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["form-analytics", filter, stepFilter],
    queryFn: async () => {
      let query = supabase
        .from("form_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filter === "abandoned") {
        query = query.eq("abandoned", true);
      } else if (filter === "completed") {
        query = query.eq("completed", true);
      }

      if (stepFilter !== "all") {
        query = query.eq("current_step", stepFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormAnalyticsRow[];
    },
  });

  // Calculate stats
  const stats = {
    total: analytics?.length || 0,
    completed: analytics?.filter(a => a.completed)?.length || 0,
    abandoned: analytics?.filter(a => a.abandoned && !a.completed)?.length || 0,
    withEmail: analytics?.filter(a => a.partial_email && a.abandoned && !a.completed)?.length || 0,
  };

  const abandonmentRate = stats.total > 0 
    ? Math.round((stats.abandoned / stats.total) * 100) 
    : 0;

  const conversionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  // Get unique steps for filter
  const uniqueSteps = [...new Set(analytics?.map(a => a.current_step) || [])];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">{conversionRate}% conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Abandoned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{stats.abandoned}</p>
            <p className="text-xs text-muted-foreground">{abandonmentRate}% drop-off</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Recoverable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.withEmail}</p>
            <p className="text-xs text-muted-foreground">abandoned with email</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="abandoned">Abandoned Only</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stepFilter} onValueChange={setStepFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by step" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Steps</SelectItem>
            {uniqueSteps.map(step => (
              <SelectItem key={step} value={step}>
                {stepLabels[step] || step}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Time on Step</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics && analytics.length > 0 ? (
                analytics.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.completed ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : row.abandoned ? (
                        <Badge className="bg-red-500/10 text-red-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Abandoned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={stepColors[row.current_step] || "bg-muted"}>
                        {stepLabels[row.current_step] || row.current_step}
                      </Badge>
                      {row.current_step === 'assessment' && row.assessment_question_number && (
                        <span className="text-xs text-muted-foreground ml-2">
                          Q{row.assessment_question_number}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.partial_email ? (
                        <span className="text-sm">{row.partial_email}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.partial_name ? (
                        <span className="text-sm">{row.partial_name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.time_on_step_seconds ? (
                        <span className="text-sm">
                          {row.time_on_step_seconds < 60 
                            ? `${row.time_on_step_seconds}s`
                            : `${Math.floor(row.time_on_step_seconds / 60)}m ${row.time_on_step_seconds % 60}s`
                          }
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.fields_completed && row.fields_completed.length > 0 ? (
                        <span className="text-sm">{row.fields_completed.length} fields</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.created_at ? (
                        <span className="text-sm text-muted-foreground" title={format(new Date(row.created_at), "PPpp")}>
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No form analytics data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}