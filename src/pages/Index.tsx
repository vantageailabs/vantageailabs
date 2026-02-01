import SEO from "@/components/SEO";
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
import AIReadinessAssessment from "@/components/AIReadinessAssessment";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pt-24 md:pt-[48px]">
      <SEO
        title="AI Solutions for Small Businesses in Albuquerque, NM"
        description="Albuquerque's AI consulting experts. We build custom AI solutions that automate your busywork, cut operational costs by 40%, and help small businesses scale without hiring. Serving New Mexico and nationwide."
        canonical="/"
        keywords="AI consulting Albuquerque, business automation New Mexico, AI solutions Albuquerque NM, small business AI, workflow automation"
      />
      <CapacityBanner />
      <Navbar />
      <Hero />
      <ProblemSection />
      <ServicesSection />
      <HowItWorksSection />
      <AIReadinessAssessment />
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
