import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import ServicesSection from "@/components/ServicesSection";
import WorkflowDemo from "@/components/WorkflowDemo";
import LeadMagnet from "@/components/LeadMagnet";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProblemSection />
      <ServicesSection />
      <WorkflowDemo />
      <LeadMagnet />
      <BookingSection />
      <Footer />
    </div>
  );
};

export default Index;
