import { Mail, Database, Calendar, BarChart3, Headphones, UserCheck, Receipt, Share2, Building2, DollarSign, Layers, Clock } from "lucide-react";
import { createElement } from "react";

export interface AssessmentQuestion {
  id: string;
  category: string;
  icon: React.ReactNode;
  question: string;
  options: { value: string; label: string; score: number }[];
  weight: number;
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // Business Profile Questions (asked first)
  {
    id: "businessType",
    category: "Business Profile",
    icon: createElement(Building2, { className: "h-5 w-5" }),
    question: "What type of business do you operate?",
    options: [
      { value: "ecommerce", label: "E-commerce/Retail", score: 0 },
      { value: "professional", label: "Professional Services", score: 0 },
      { value: "saas", label: "SaaS/Technology", score: 0 },
      { value: "local", label: "Local Business", score: 0 },
      { value: "b2b", label: "B2B Services", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "monthlyRevenue",
    category: "Revenue Range",
    icon: createElement(DollarSign, { className: "h-5 w-5" }),
    question: "What is your current monthly revenue range?",
    options: [
      { value: "50k_plus", label: "$50,000+ monthly", score: 0 },
      { value: "20k_50k", label: "$20,000-$49,999 monthly", score: 0 },
      { value: "10k_20k", label: "$10,000-$19,999 monthly", score: 0 },
      { value: "5k_10k", label: "$5,000-$9,999 monthly", score: 0 },
      { value: "under_5k", label: "Under $5,000 monthly", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "toolStack",
    category: "Current Tool Stack",
    icon: createElement(Layers, { className: "h-5 w-5" }),
    question: "What does your current technology stack look like?",
    options: [
      { value: "advanced", label: "Advanced Stack - CRM, marketing automation, analytics", score: 0 },
      { value: "moderate", label: "Moderate Stack - Email platform, basic CRM, accounting", score: 0 },
      { value: "basic", label: "Basic Stack - Email, spreadsheets, basic website", score: 0 },
      { value: "starting", label: "Starting Stack - Gmail, social media, basic website", score: 0 },
      { value: "manual", label: "Manual Operations - Minimal software usage", score: 0 },
    ],
    weight: 0,
  },
  {
    id: "timeline",
    category: "Investment Timeline",
    icon: createElement(Clock, { className: "h-5 w-5" }),
    question: "When would you like to implement automation?",
    options: [
      { value: "immediate", label: "Immediate - Ready to start within 1-2 weeks", score: 0 },
      { value: "fast", label: "Fast Track - Want to begin within 3-4 weeks", score: 0 },
      { value: "standard", label: "Standard Timeline - Ready within 1-2 months", score: 0 },
      { value: "future", label: "Future Planning - Interested in 3-6 months", score: 0 },
      { value: "research", label: "Information Gathering - Timeline flexible", score: 0 },
    ],
    weight: 0,
  },
  // Task Questions (asked second)
  {
    id: "email",
    category: "Email & Communication",
    icon: createElement(Mail, { className: "h-5 w-5" }),
    question: "How many hours per week does your team spend on customer emails, follow-ups, and newsletters?",
    options: [
      { value: "heavy", label: "Heavy (15+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (8-12 hrs/week)", score: 75 },
      { value: "light", label: "Light (4-7 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.2,
  },
  {
    id: "dataEntry",
    category: "Data Entry & Documentation",
    icon: createElement(Database, { className: "h-5 w-5" }),
    question: "How much time is spent manually entering data into spreadsheets, CRMs, or databases?",
    options: [
      { value: "heavy", label: "Heavy (10+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-5 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.1,
  },
  {
    id: "scheduling",
    category: "Scheduling & Calendar",
    icon: createElement(Calendar, { className: "h-5 w-5" }),
    question: "How many hours are spent coordinating meetings, appointments, and rescheduling?",
    options: [
      { value: "heavy", label: "Heavy (8+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (4-8 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-4 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.0,
  },
  {
    id: "reporting",
    category: "Report Generation",
    icon: createElement(BarChart3, { className: "h-5 w-5" }),
    question: "How much time is spent creating reports, dashboards, and performance summaries?",
    options: [
      { value: "heavy", label: "Heavy (10+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-5 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.9,
  },
  {
    id: "support",
    category: "Customer Support",
    icon: createElement(Headphones, { className: "h-5 w-5" }),
    question: "How many hours are spent answering repetitive questions and handling support tickets?",
    options: [
      { value: "heavy", label: "Heavy (15+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (8-15 hrs/week)", score: 75 },
      { value: "light", label: "Light (4-8 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.15,
  },
  {
    id: "leadFollowup",
    category: "Lead Follow-up",
    icon: createElement(UserCheck, { className: "h-5 w-5" }),
    question: "How much time is spent on lead qualification, initial outreach, and nurturing?",
    options: [
      { value: "heavy", label: "Heavy (10+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-5 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 1.1,
  },
  {
    id: "invoicing",
    category: "Invoice & Payments",
    icon: createElement(Receipt, { className: "h-5 w-5" }),
    question: "How many hours are spent on billing, payment reminders, and reconciliation?",
    options: [
      { value: "heavy", label: "Heavy (8+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (4-8 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-4 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.85,
  },
  {
    id: "socialMedia",
    category: "Social Media & Content",
    icon: createElement(Share2, { className: "h-5 w-5" }),
    question: "How much time is spent on posting, engagement, and content scheduling?",
    options: [
      { value: "heavy", label: "Heavy (10+ hrs/week)", score: 100 },
      { value: "moderate", label: "Moderate (5-10 hrs/week)", score: 75 },
      { value: "light", label: "Light (2-5 hrs/week)", score: 50 },
      { value: "none", label: "None", score: 25 },
      { value: "automated", label: "Already Automated", score: 0 },
    ],
    weight: 0.8,
  },
];

export interface AssessmentResults {
  overallScore: number;
  estimatedHoursSaved: number;
  estimatedMonthlySavings: number;
  businessType: string | null;
  monthlyRevenue: string | null;
  toolStack: string | null;
  timeline: string | null;
}

export interface CategoryResult {
  category: string;
  score: number;
  icon: React.ReactNode;
}

export const calculateAssessmentResults = (answers: Record<string, string>): AssessmentResults & { categories: CategoryResult[] } => {
  const taskQuestions = assessmentQuestions.filter(q => q.weight > 0);
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let estimatedHours = 0;

  const categories: CategoryResult[] = taskQuestions.map((q) => {
    const answer = answers[q.id];
    const option = q.options.find((opt) => opt.value === answer);
    const score = option?.score || 0;
    
    totalWeightedScore += score * q.weight;
    totalWeight += q.weight * 100;

    const hourMap: Record<string, number> = {
      heavy: 12,
      moderate: 7,
      light: 4,
      none: 0,
      automated: 0,
    };
    estimatedHours += (hourMap[answer] || 0) * 0.65;

    return {
      category: q.category,
      score,
      icon: q.icon,
    };
  });

  const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  const hourlyRate = 50;
  const estimatedMonthlySavings = Math.round(estimatedHours * 4 * hourlyRate * (overallScore / 100));

  return {
    overallScore,
    estimatedHoursSaved: Math.round(estimatedHours),
    estimatedMonthlySavings,
    categories,
    businessType: answers.businessType || null,
    monthlyRevenue: answers.monthlyRevenue || null,
    toolStack: answers.toolStack || null,
    timeline: answers.timeline || null,
  };
};

export const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 70) return { label: "High Automation Potential", color: "text-green-500" };
  if (score >= 40) return { label: "Moderate Automation Potential", color: "text-yellow-500" };
  return { label: "Low Automation Potential", color: "text-muted-foreground" };
};

export const getTopRecommendations = (categories: CategoryResult[]): CategoryResult[] => {
  return [...categories]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const timelineMessages: Record<string, string> = {
  immediate: "We can get started right away.",
  fast: "We'll have you up and running in 3-4 weeks.",
  standard: "A 1-2 month timeline allows for thorough implementation.",
  future: "We'll keep you informed and ready for when you're prepared.",
  research: "Take your time—we're here when you're ready.",
};
