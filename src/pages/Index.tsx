import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import ROICalculator from "@/components/ROICalculator";
import FAQSection from "@/components/FAQSection";
import GuaranteeSection from "@/components/GuaranteeSection";
import LeadMagnet from "@/components/LeadMagnet";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import { CapacityBanner } from "@/components/CapacityBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pt-24 md:pt-[48px]">
      <CapacityBanner />
      <Navbar />
      <Hero />
      <ProblemSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <AboutSection />
      <ROICalculator />
      <FAQSection />
      <GuaranteeSection />
      <LeadMagnet />
      <BookingSection />
      <Footer />
    </div>
  );
};

export default Index;
