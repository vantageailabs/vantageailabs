import { lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Loader2, Calendar, Clock, Ban, Users, LogOut, Settings, ArrowLeft, ClipboardList, Briefcase, Package, TrendingUp, Mail, Lightbulb, Activity } from 'lucide-react';

// Lazy load all admin components
const AppointmentsList = lazy(() => import('@/components/admin/AppointmentsList').then(m => ({ default: m.AppointmentsList })));
const WorkingHoursEditor = lazy(() => import('@/components/admin/WorkingHoursEditor').then(m => ({ default: m.WorkingHoursEditor })));
const BlockedDatesManager = lazy(() => import('@/components/admin/BlockedDatesManager').then(m => ({ default: m.BlockedDatesManager })));
const LeadsList = lazy(() => import('@/components/admin/LeadsList').then(m => ({ default: m.LeadsList })));
const AssessmentsList = lazy(() => import('@/components/admin/AssessmentsList').then(m => ({ default: m.AssessmentsList })));
const CalendarStatus = lazy(() => import('@/components/admin/CalendarStatus').then(m => ({ default: m.CalendarStatus })));
const ClientsList = lazy(() => import('@/components/admin/ClientsList').then(m => ({ default: m.ClientsList })));
const ServicesManager = lazy(() => import('@/components/admin/ServicesManager').then(m => ({ default: m.ServicesManager })));
const SupportPackagesManager = lazy(() => import('@/components/admin/SupportPackagesManager').then(m => ({ default: m.SupportPackagesManager })));
const CouponsManager = lazy(() => import('@/components/admin/CouponsManager').then(m => ({ default: m.CouponsManager })));
const CapacitySettings = lazy(() => import('@/components/admin/CapacitySettings').then(m => ({ default: m.CapacitySettings })));
const ContactSubmissionsList = lazy(() => import('@/components/admin/ContactSubmissionsList').then(m => ({ default: m.ContactSubmissionsList })));
const FeatureRequestsList = lazy(() => import('@/components/admin/FeatureRequestsList').then(m => ({ default: m.FeatureRequestsList })));
const FormAnalyticsList = lazy(() => import('@/components/admin/FormAnalyticsList').then(m => ({ default: m.FormAnalyticsList })));

const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function DashboardContent() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to site
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-11 w-full">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden lg:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden lg:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden lg:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden lg:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="feature-requests" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden lg:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden lg:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden lg:inline">Capacity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span className="hidden lg:inline">Blocked</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Appointments</h2>
              <p className="text-muted-foreground">Manage your scheduled appointments</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <AppointmentsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="clients" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Clients</h2>
              <p className="text-muted-foreground">Manage client relationships and assigned services</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <ClientsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="assessments" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">AI Readiness Assessments</h2>
              <p className="text-muted-foreground">View submitted assessments and automation potential scores</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <AssessmentsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="leads" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Leads</h2>
              <p className="text-muted-foreground">View and export email submissions</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <LeadsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="contact" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Contact Submissions</h2>
              <p className="text-muted-foreground">View and respond to contact form submissions</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <ContactSubmissionsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Form Analytics</h2>
              <p className="text-muted-foreground">Track form interactions, abandonments, and conversion rates</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <FormAnalyticsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="feature-requests" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Feature Requests</h2>
              <p className="text-muted-foreground">Review and quote incoming feature requests from clients</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <FeatureRequestsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="services" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Services & Packages</h2>
              <p className="text-muted-foreground">Manage your service offerings and support packages</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <div className="space-y-8">
                <ServicesManager />
                <SupportPackagesManager />
                <CouponsManager />
              </div>
            </Suspense>
          </TabsContent>

          <TabsContent value="capacity" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Capacity Management</h2>
              <p className="text-muted-foreground">Control monthly client capacity for urgency messaging</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <CapacitySettings />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Calendar Settings</h2>
              <p className="text-muted-foreground">Configure working hours and appointment settings</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <CalendarStatus />
                <WorkingHoursEditor />
              </div>
            </Suspense>
          </TabsContent>

          <TabsContent value="blocked" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Blocked Dates</h2>
              <p className="text-muted-foreground">Set dates when you're unavailable</p>
            </div>
            <Suspense fallback={<TabLoader />}>
              <BlockedDatesManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
