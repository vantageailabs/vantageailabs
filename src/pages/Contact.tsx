import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Send } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const { trackPartialData, trackFieldBlur, trackComplete } = useFormAnalytics({ 
    initialStep: 'contact' 
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Track email and name for abandonment recovery
    if (field === 'email' && value.includes('@')) {
      trackPartialData('email', value);
    } else if (field === 'name' && value.length > 2) {
      trackPartialData('name', value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Send notification and auto-response emails
    try {
      await supabase.functions.invoke('send-contact-emails', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }
      });
    } catch (emailError) {
      console.error('Failed to send notification emails:', emailError);
      // Don't show error to user - form was still saved
    }
    
    // Track completion
    await trackComplete();
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us"
        description="Get in touch with Vantage AI Labs in Albuquerque, NM. Questions about AI automation, custom apps, or our services? We'd love to hear from you."
        canonical="/contact"
        keywords="contact Vantage AI Labs, AI consulting Albuquerque contact, New Mexico tech company"
      />
      <div className="container px-4 py-16 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="font-display text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={(e) => trackFieldBlur('name', !!e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={(e) => trackFieldBlur('email', !!e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  onBlur={(e) => trackFieldBlur('subject', !!e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  onBlur={(e) => trackFieldBlur('message', !!e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Ready to transform your business with AI automation? Schedule a free consultation 
                or reach out with any questions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">contact@vantageailabs.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-muted-foreground">
                    7410 Montgomery Blvd NE #203<br />
                    Albuquerque, NM 87109
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">Serving clients nationwide</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-muted/50 border border-border">
              <h3 className="font-semibold mb-2">Prefer a call?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Schedule a free 30-minute consultation to discuss your automation needs.
              </p>
              <Link to="/#booking">
                <Button variant="outline" className="w-full">
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
