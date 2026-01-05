import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AIReadinessAssessment from "@/components/AIReadinessAssessment";
import ROICalculator from "@/components/ROICalculator";
import FAQSection from "@/components/FAQSection";
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
      <HowItWorksSection />
      <TestimonialsSection />
      <AIReadinessAssessment />
      <ROICalculator />
      <FAQSection />
      <LeadMagnet />
      <BookingSection />
      <Footer />
    </div>
  );
};

export default Index;
