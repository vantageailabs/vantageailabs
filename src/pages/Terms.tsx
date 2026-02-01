import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service"
        description="Vantage AI Labs terms of service. Read our terms and conditions for using our AI consulting and automation services."
        canonical="/terms"
      />
      <div className="container px-4 py-16 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="font-display text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Vantage AI Labs' services, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Services Description</h2>
            <p>
              Vantage AI Labs provides AI automation consulting and implementation services for small businesses. 
              Our services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI readiness assessments</li>
              <li>Custom automation solutions</li>
              <li>Workflow optimization</li>
              <li>Ongoing support and maintenance</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Client Responsibilities</h2>
            <p>As a client, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Cooperate with our team during the implementation process</li>
              <li>Maintain confidentiality of any proprietary information shared</li>
              <li>Make timely payments as agreed upon</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Payment Terms</h2>
            <p>
              Payment terms will be outlined in individual service agreements. Unless otherwise specified, 
              payments are due within 30 days of invoice date. Late payments may incur additional fees.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              All intellectual property rights in our methodologies, tools, and proprietary systems remain 
              with Vantage AI Labs. Clients receive a license to use delivered solutions for their business purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Confidentiality</h2>
            <p>
              Both parties agree to maintain the confidentiality of proprietary information shared during 
              our engagement. This obligation survives the termination of our business relationship.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>
              Vantage AI Labs shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages resulting from your use of our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Termination</h2>
            <p>
              Either party may terminate services with 30 days written notice. Upon termination, 
              client remains responsible for payment of services rendered.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Contact</h2>
            <p>
              For questions about these Terms, please visit our 
              <Link to="/contact" className="text-primary hover:underline ml-1">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
