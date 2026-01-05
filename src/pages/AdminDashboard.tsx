import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AppointmentsList } from '@/components/admin/AppointmentsList';
import { WorkingHoursEditor } from '@/components/admin/WorkingHoursEditor';
import { BlockedDatesManager } from '@/components/admin/BlockedDatesManager';
import { LeadsList } from '@/components/admin/LeadsList';
import { AssessmentsList } from '@/components/admin/AssessmentsList';
import { CalendarStatus } from '@/components/admin/CalendarStatus';
import { ClientsList } from '@/components/admin/ClientsList';
import { ServicesManager } from '@/components/admin/ServicesManager';
import { SupportPackagesManager } from '@/components/admin/SupportPackagesManager';
import { CapacitySettings } from '@/components/admin/CapacitySettings';
import { ContactSubmissionsList } from '@/components/admin/ContactSubmissionsList';
import { Calendar, Clock, Ban, Users, LogOut, Settings, ArrowLeft, ClipboardList, Briefcase, Package, TrendingUp, Mail } from 'lucide-react';

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
          <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
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
            <AppointmentsList />
          </TabsContent>

          <TabsContent value="clients" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Clients</h2>
              <p className="text-muted-foreground">Manage client relationships and assigned services</p>
            </div>
            <ClientsList />
          </TabsContent>

          <TabsContent value="assessments" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">AI Readiness Assessments</h2>
              <p className="text-muted-foreground">View submitted assessments and automation potential scores</p>
            </div>
            <AssessmentsList />
          </TabsContent>

          <TabsContent value="leads" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Leads</h2>
              <p className="text-muted-foreground">View and export email submissions</p>
            </div>
            <LeadsList />
          </TabsContent>

          <TabsContent value="contact" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Contact Submissions</h2>
              <p className="text-muted-foreground">View and respond to contact form submissions</p>
            </div>
            <ContactSubmissionsList />
          </TabsContent>

          <TabsContent value="services" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Services & Packages</h2>
              <p className="text-muted-foreground">Manage your service offerings and support packages</p>
            </div>
            <div className="space-y-8">
              <ServicesManager />
              <SupportPackagesManager />
            </div>
          </TabsContent>

          <TabsContent value="capacity" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Capacity Management</h2>
              <p className="text-muted-foreground">Control monthly client capacity for urgency messaging</p>
            </div>
            <CapacitySettings />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Calendar Settings</h2>
              <p className="text-muted-foreground">Configure working hours and appointment settings</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <CalendarStatus />
              <WorkingHoursEditor />
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Blocked Dates</h2>
              <p className="text-muted-foreground">Set dates when you're unavailable</p>
            </div>
            <BlockedDatesManager />
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
