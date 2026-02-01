import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager load homepage for instant rendering
import Index from "./pages/Index";

// Lazy load all other pages
const Book = lazy(() => import("./pages/Book"));
const Referrals = lazy(() => import("./pages/Referrals"));
const BookingConfirmed = lazy(() => import("./pages/BookingConfirmed"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Assessment = lazy(() => import("./pages/Assessment"));
const CancelAppointment = lazy(() => import("./pages/CancelAppointment"));
const RescheduleAppointment = lazy(() => import("./pages/RescheduleAppointment"));
const CredentialSubmission = lazy(() => import("./pages/CredentialSubmission"));
const CurrentCustomerQuotes = lazy(() => import("./pages/CurrentCustomerQuotes"));
const BOS = lazy(() => import("./pages/BOS"));
const CoachBuild = lazy(() => import("./pages/CoachBuild"));
const Websites = lazy(() => import("./pages/Websites"));
const Automation = lazy(() => import("./pages/Automation"));
const AIAssistants = lazy(() => import("./pages/AIAssistants"));
const CustomApps = lazy(() => import("./pages/CustomApps"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/book" element={<Book />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/booking-confirmed" element={<BookingConfirmed />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cancel-appointment" element={<CancelAppointment />} />
              <Route path="/reschedule" element={<RescheduleAppointment />} />
              <Route path="/credentials/:token" element={<CredentialSubmission />} />
              <Route path="/current-customer-quotes" element={<CurrentCustomerQuotes />} />
              <Route path="/bos" element={<BOS />} />
              <Route path="/coach-build" element={<CoachBuild />} />
              <Route path="/websites" element={<Websites />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/ai-assistants" element={<AIAssistants />} />
              <Route path="/custom-apps" element={<CustomApps />} />
              <Route path="/support" element={<Support />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
