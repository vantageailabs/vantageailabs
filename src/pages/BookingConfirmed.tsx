import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Video, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BookingConfirmed = () => {
  const [searchParams] = useSearchParams();
  
  const meetUrl = searchParams.get('meet');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  
  // Format the date for display
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }) : null;
  
  // Format time (convert 24h to 12h format)
  const formattedTime = time ? (() => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  })() : null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-[48px]">
      <Navbar />
      
      <main className="py-20 md:py-32">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="card-elevated p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10 text-primary" />
              </div>
              
              {/* Main Heading */}
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                You're All Set! 🎉
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Your strategy call has been confirmed. Check your email for the meeting details and your AI Readiness Assessment results.
              </p>
              
              {/* Appointment Details */}
              {(formattedDate || formattedTime) && (
                <div className="bg-muted/50 rounded-xl p-6 mb-8 inline-block">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Your Strategy Call</span>
                  </div>
                  {formattedDate && (
                    <p className="font-semibold text-xl mb-1">{formattedDate}</p>
                  )}
                  {formattedTime && (
                    <p className="font-semibold text-xl text-primary">{formattedTime}</p>
                  )}
                </div>
              )}
              
              {/* Assessment Completed Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                <Check className="w-4 h-4 text-primary" />
                <span>Assessment completed — results included in your confirmation email</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {meetUrl && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => window.open(decodeURIComponent(meetUrl), '_blank')}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Google Meet
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <Link to="/">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
              
              {/* Additional Info */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>You'll receive a confirmation email with your meeting link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>We'll review your assessment results before the call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Come prepared to discuss your biggest operational challenges</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmed;