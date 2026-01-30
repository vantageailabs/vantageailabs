import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Book from "./pages/Book";
import Referrals from "./pages/Referrals";
import Services from "./pages/Services";
import BookingConfirmed from "./pages/BookingConfirmed";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Assessment from "./pages/Assessment";
import CancelAppointment from "./pages/CancelAppointment";
import RescheduleAppointment from "./pages/RescheduleAppointment";
import CredentialSubmission from "./pages/CredentialSubmission";
import CurrentCustomerQuotes from "./pages/CurrentCustomerQuotes";
import BOS from "./pages/BOS";
import CoachBuild from "./pages/CoachBuild";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/book" element={<Book />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/services" element={<Services />} />
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
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
