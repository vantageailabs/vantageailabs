import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AppointmentsList } from '@/components/admin/AppointmentsList';
import { WorkingHoursEditor } from '@/components/admin/WorkingHoursEditor';
import { BlockedDatesManager } from '@/components/admin/BlockedDatesManager';
import { LeadsList } from '@/components/admin/LeadsList';
import { Calendar, Clock, Ban, Users, LogOut, Settings, ArrowLeft } from 'lucide-react';

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
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Blocked</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Appointments</h2>
              <p className="text-muted-foreground">Manage your scheduled appointments</p>
            </div>
            <AppointmentsList />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Calendar Settings</h2>
              <p className="text-muted-foreground">Configure working hours and appointment settings</p>
            </div>
            <WorkingHoursEditor />
          </TabsContent>

          <TabsContent value="blocked" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Blocked Dates</h2>
              <p className="text-muted-foreground">Set dates when you're unavailable</p>
            </div>
            <BlockedDatesManager />
          </TabsContent>

          <TabsContent value="leads" className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Leads</h2>
              <p className="text-muted-foreground">View and export email submissions</p>
            </div>
            <LeadsList />
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
