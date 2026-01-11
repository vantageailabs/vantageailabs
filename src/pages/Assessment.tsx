import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AssessmentResults, CategoryResult } from "@/lib/assessmentQuestions";

const Assessment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleComplete = async (
    results: AssessmentResults & { categories: CategoryResult[] },
    answers: Record<string, string>,
    additionalNotes?: string
  ) => {
    setIsSubmitting(true);
    
    try {
      // Check if this is an email-only action
      const isEmailOnly = answers.action === 'email_only';
      
      const { data, error } = await supabase.from("assessment_responses").insert({
        overall_score: results.overallScore,
        estimated_hours_saved: results.estimatedHoursSaved,
        estimated_monthly_savings: results.estimatedMonthlySavings,
        answers: { ...answers, additional_notes: additionalNotes },
        business_type: results.businessType,
        monthly_revenue: results.monthlyRevenue,
        tool_stack: results.toolStack,
        timeline: results.timeline,
        email: isEmailOnly ? answers.contact_email : null,
      }).select().single();

      if (error) throw error;

      if (isEmailOnly) {
        // Just save and show success
        toast({
          title: "Results Sent!",
          description: "We'll review your assessment and follow up shortly.",
        });
      } else {
        // Store assessment data in sessionStorage for booking flow to link
        if (data) {
          const pendingAssessment = {
            id: data.id,
            createdAt: Date.now(),
            source: 'assessment_results'
          };
          sessionStorage.setItem('pending_assessment', JSON.stringify(pendingAssessment));
        }

        // Navigate to homepage and scroll to booking
        navigate('/#booking');
        
        // Small delay to ensure navigation completes
        setTimeout(() => {
          const bookingSection = document.getElementById('booking');
          if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);

        toast({
          title: "Assessment Saved!",
          description: "Now let's schedule your strategy call.",
        });
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-[48px]">
      <Navbar />
      <section className="py-20 px-4 bg-muted/30">
        <AssessmentFlow 
          mode="standalone" 
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
        />
      </section>
      <Footer />
    </div>
  );
};

export default Assessment;
