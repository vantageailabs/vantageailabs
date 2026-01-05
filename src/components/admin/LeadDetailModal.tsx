import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { 
  Mail, Database, Calendar, BarChart3, Headphones, UserCheck, 
  Receipt, Share2, Building2, DollarSign, Layers, Clock 
} from 'lucide-react';

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    email: string;
    source: string | null;
    created_at: string;
    type: 'lead_magnet' | 'assessment';
    assessment_score?: number;
    answers?: Record<string, string>;
    estimated_hours_saved?: number;
    estimated_monthly_savings?: number;
    business_type?: string | null;
    monthly_revenue?: string | null;
    tool_stack?: string | null;
    timeline?: string | null;
  } | null;
}

// Question definitions for displaying answers
const questionConfig: Record<string, { 
  category: string; 
  question: string; 
  icon: React.ReactNode;
  options: Record<string, string>;
}> = {
  email: {
    category: "Email & Communication",
    question: "Hours per week on customer emails, follow-ups, and newsletters",
    icon: <Mail className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (15+ hours/week)",
      moderate: "Moderate (8-12 hours/week)",
      light: "Light (4-7 hours/week)",
      minimal: "Minimal (2-3 hours/week)",
      automated: "Already Automated",
    },
  },
  dataEntry: {
    category: "Data Entry & Documentation",
    question: "Time spent manually entering data into spreadsheets, CRMs, or databases",
    icon: <Database className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (10+ hours/week)",
      moderate: "Moderate (5-10 hours/week)",
      light: "Light (2-5 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  scheduling: {
    category: "Scheduling & Calendar",
    question: "Hours coordinating meetings, appointments, and rescheduling",
    icon: <Calendar className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (8+ hours/week)",
      moderate: "Moderate (4-8 hours/week)",
      light: "Light (2-4 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  reporting: {
    category: "Report Generation",
    question: "Time creating reports, dashboards, and performance summaries",
    icon: <BarChart3 className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (10+ hours/week)",
      moderate: "Moderate (5-10 hours/week)",
      light: "Light (2-5 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  support: {
    category: "Customer Support",
    question: "Hours answering repetitive questions and handling support tickets",
    icon: <Headphones className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (15+ hours/week)",
      moderate: "Moderate (8-15 hours/week)",
      light: "Light (4-8 hours/week)",
      minimal: "Minimal (under 4 hours/week)",
      automated: "Already Automated",
    },
  },
  leadFollowup: {
    category: "Lead Follow-up",
    question: "Time on lead qualification, initial outreach, and nurturing",
    icon: <UserCheck className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (10+ hours/week)",
      moderate: "Moderate (5-10 hours/week)",
      light: "Light (2-5 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  invoicing: {
    category: "Invoice & Payments",
    question: "Hours on billing, payment reminders, and reconciliation",
    icon: <Receipt className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (8+ hours/week)",
      moderate: "Moderate (4-8 hours/week)",
      light: "Light (2-4 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  socialMedia: {
    category: "Social Media & Content",
    question: "Time on posting, engagement, and content scheduling",
    icon: <Share2 className="h-4 w-4" />,
    options: {
      heavy: "Heavy Load (10+ hours/week)",
      moderate: "Moderate (5-10 hours/week)",
      light: "Light (2-5 hours/week)",
      minimal: "Minimal (under 2 hours/week)",
      automated: "Already Automated",
    },
  },
  businessType: {
    category: "Business Profile",
    question: "Type of business",
    icon: <Building2 className="h-4 w-4" />,
    options: {
      ecommerce: "E-commerce/Retail",
      professional: "Professional Services",
      saas: "SaaS/Technology",
      local: "Local Business",
      b2b: "B2B Services",
    },
  },
  monthlyRevenue: {
    category: "Revenue Range",
    question: "Monthly revenue range",
    icon: <DollarSign className="h-4 w-4" />,
    options: {
      "50k_plus": "$50,000+ monthly",
      "20k_50k": "$20,000-$49,999 monthly",
      "10k_20k": "$10,000-$19,999 monthly",
      "5k_10k": "$5,000-$9,999 monthly",
      under_5k: "Under $5,000 monthly",
    },
  },
  toolStack: {
    category: "Current Tool Stack",
    question: "Current technology stack",
    icon: <Layers className="h-4 w-4" />,
    options: {
      advanced: "Advanced Stack",
      moderate: "Moderate Stack",
      basic: "Basic Stack",
      starting: "Starting Stack",
      manual: "Manual Operations",
    },
  },
  timeline: {
    category: "Investment Timeline",
    question: "When they want to implement automation",
    icon: <Clock className="h-4 w-4" />,
    options: {
      immediate: "Immediate (1-2 weeks)",
      fast: "Fast Track (3-4 weeks)",
      standard: "Standard (1-2 months)",
      future: "Future (3-6 months)",
      research: "Information Gathering",
    },
  },
};

const operationalQuestions = ['email', 'dataEntry', 'scheduling', 'reporting', 'support', 'leadFollowup', 'invoicing', 'socialMedia'];
const businessQuestions = ['businessType', 'monthlyRevenue', 'toolStack', 'timeline'];

export function LeadDetailModal({ open, onOpenChange, lead }: LeadDetailModalProps) {
  if (!lead) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Automation Potential';
    if (score >= 40) return 'Moderate Automation Potential';
    return 'Low Automation Potential';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Lead Details
            {lead.type === 'assessment' && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10">
                Assessment - No Call Booked
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{lead.source || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">{format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{lead.type === 'lead_magnet' ? 'Lead Magnet' : 'Assessment'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Results */}
          {lead.type === 'assessment' && lead.assessment_score !== undefined && (
            <>
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-4">Assessment Results</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(lead.assessment_score)}`}>
                          {lead.assessment_score}%
                        </span>
                      </div>
                      <Progress value={lead.assessment_score} className="h-3" />
                      <p className={`text-sm mt-1 ${getScoreColor(lead.assessment_score)}`}>
                        {getScoreLabel(lead.assessment_score)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {lead.estimated_hours_saved !== undefined && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Estimated Hours Saved</p>
                          <p className="text-xl font-bold text-primary">{lead.estimated_hours_saved} hrs/week</p>
                        </div>
                      )}
                      {lead.estimated_monthly_savings !== undefined && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Estimated Monthly Savings</p>
                          <p className="text-xl font-bold text-green-500">
                            ${lead.estimated_monthly_savings.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Profile */}
              {lead.answers && (
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-4">Business Profile</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {businessQuestions.map((qId) => {
                        const config = questionConfig[qId];
                        const answer = lead.answers?.[qId];
                        if (!config || !answer) return null;
                        return (
                          <div key={qId} className="flex items-start gap-2">
                            <div className="text-muted-foreground mt-0.5">{config.icon}</div>
                            <div>
                              <p className="text-xs text-muted-foreground">{config.category}</p>
                              <p className="text-sm font-medium">{config.options[answer] || answer}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operational Answers */}
              {lead.answers && (
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-4">Operational Assessment</h3>
                    <div className="space-y-3">
                      {operationalQuestions.map((qId) => {
                        const config = questionConfig[qId];
                        const answer = lead.answers?.[qId];
                        if (!config || !answer) return null;
                        
                        const isHighPotential = answer === 'heavy' || answer === 'moderate';
                        
                        return (
                          <div 
                            key={qId} 
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isHighPotential ? 'bg-primary/10' : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-muted-foreground">{config.icon}</div>
                              <span className="text-sm">{config.category}</span>
                            </div>
                            <Badge variant={isHighPotential ? 'default' : 'secondary'}>
                              {config.options[answer] || answer}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Lead Magnet Only */}
          {lead.type === 'lead_magnet' && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>This lead came from the lead magnet signup.</p>
                <p className="text-sm mt-1">No assessment data available.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}