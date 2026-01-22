import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlueprintRequest {
  email: string;
  name?: string;
  businessName?: string;
  selectedModules: string[];
  totalPrice: number;
  totalHoursSaved: number;
  suggestedTier: string;
}

// Module details for the email
const moduleDetails: Record<string, { name: string; value: string }> = {
  recovery: { name: "Lead Recovery Module", value: "+15% Lead Volume" },
  sms: { name: "SMS Speed-to-Lead", value: "+2x Booking Rate" },
  booking: { name: "Direct Booking Integration", value: "Frictionless Sales" },
  reviews: { name: "Review Booster", value: "SEO Authority" },
  nurture: { name: "7-Day Nurture Sequence", value: "+20% Conversions" },
  "ai-agent": { name: "AI Intake Agent", value: "Saves 5 hrs/week" },
  dashboard: { name: "Performance Dashboard", value: "Data Visibility" },
  "field-sync": { name: "Field Tool Integration", value: "Operations" },
  portal: { name: "Customer Portal", value: "Trust & Transparency" },
  "ai-phone": { name: "AI Phone Agent", value: "24/7 Availability" },
  "multi-location": { name: "Multi-Location Support", value: "Scalability" },
  invoicing: { name: "Automated Invoicing", value: "Faster Payments" },
  inventory: { name: "Inventory Tracking", value: "Cost Control" },
  "employee-scheduling": { name: "Employee Scheduling", value: "Efficiency" },
  "marketing-automation": { name: "Marketing Automation", value: "Revenue Growth" },
  "crm-sync": { name: "CRM Integration", value: "Data Sync" },
  "payment-processing": { name: "Payment Processing", value: "Convenience" },
  "estimate-builder": { name: "Digital Estimate Builder", value: "Close Faster" },
  "warranty-tracking": { name: "Warranty & Maintenance Tracking", value: "Recurring Revenue" },
};

const generateBlueprintEmailHtml = (data: BlueprintRequest): string => {
  const { name, businessName, selectedModules, totalPrice, totalHoursSaved, suggestedTier } = data;
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  const businessText = businessName ? ` for ${businessName}` : "";

  const selectedModulesHtml = selectedModules.length > 0
    ? selectedModules.map(id => {
        const module = moduleDetails[id];
        if (!module) return "";
        return `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #333;">
              <strong style="color: #ffffff;">${module.name}</strong>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #333; text-align: right;">
              <span style="color: #d4a574;">${module.value}</span>
            </td>
          </tr>
        `;
      }).join("")
    : `
        <tr>
          <td colspan="2" style="padding: 16px; text-align: center; color: #888;">
            No add-ons selected — just the Foundation package
          </td>
        </tr>
      `;

  const weeklyMoneySaved = totalHoursSaved * 50; // Assuming $50/hr labor
  const annualSavings = weeklyMoneySaved * 52;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Custom BOS Blueprint</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #d4a574; font-size: 28px; margin: 0 0 8px 0;">Your Custom BOS Blueprint</h1>
      <p style="color: #888; margin: 0;">Built${businessText} by Vantage AI Labs</p>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 32px;">
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        ${greeting}
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0;">
        Here's your personalized Business Operating System blueprint based on the configuration you built. This isn't just a quote—it's a roadmap to eliminating the chaos between "lead" and "revenue."
      </p>
    </div>

    <!-- Summary Box -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%); border: 1px solid #333; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0; text-align: center;">Your Configuration Summary</h2>
      
      <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px;">
        <div style="flex: 1;">
          <p style="font-size: 32px; font-weight: bold; color: #d4a574; margin: 0;">$${totalPrice.toLocaleString()}</p>
          <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Investment</p>
        </div>
        <div style="flex: 1;">
          <p style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0;">${totalHoursSaved}</p>
          <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Hrs/Week Saved</p>
        </div>
      </div>

      <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #d4a574;">
          💡 Suggested Package: <strong>${suggestedTier}</strong>
        </p>
      </div>
    </div>

    <!-- Foundation Features -->
    <div style="margin-bottom: 24px;">
      <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #333; padding-bottom: 8px;">
        ✓ Foundation Features (Included)
      </h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #888; font-size: 14px; line-height: 1.8;">
        <li>High-Conversion Interface (sub-1s load)</li>
        <li>Standard Lead Intake Forms</li>
        <li>Google Business Profile Sync</li>
        <li>Unified Lead Inbox</li>
        <li>Email Notifications</li>
      </ul>
    </div>

    <!-- Selected Add-ons -->
    <div style="margin-bottom: 32px;">
      <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #333; padding-bottom: 8px;">
        ⚡ Your Selected Add-ons
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${selectedModulesHtml}
      </table>
    </div>

    <!-- ROI Projection -->
    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0; text-align: center;">
        📈 Projected ROI
      </h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #888;">Weekly Time Saved:</td>
          <td style="padding: 8px 0; text-align: right; color: #ffffff; font-weight: bold;">${totalHoursSaved} hours</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888;">Est. Weekly Value (@ $50/hr):</td>
          <td style="padding: 8px 0; text-align: right; color: #ffffff; font-weight: bold;">$${weeklyMoneySaved.toLocaleString()}</td>
        </tr>
        <tr style="border-top: 1px solid #333;">
          <td style="padding: 16px 0 0 0; color: #d4a574; font-weight: bold;">Annual Savings:</td>
          <td style="padding: 16px 0 0 0; text-align: right; color: #d4a574; font-size: 24px; font-weight: bold;">$${annualSavings.toLocaleString()}</td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #666; margin: 16px 0 0 0; text-align: center;">
        *Based on $50/hour labor cost. Your actual savings may vary based on your team's rates and current efficiency.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 40px;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Ready to turn this blueprint into reality?
      </p>
      <a href="https://vantageailabs.lovable.app/book" style="display: inline-block; background: #d4a574; color: #0a0a0a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Book Your Strategy Session
      </a>
      <p style="font-size: 14px; color: #888; margin: 16px 0 0 0;">
        No pressure. Just a conversation about what's possible.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #333; padding-top: 24px; text-align: center;">
      <p style="color: #888; font-size: 12px; margin: 0 0 8px 0;">
        Vantage AI Labs — Automation That Actually Works
      </p>
      <p style="color: #666; font-size: 12px; margin: 0;">
        Questions? Reply to this email or visit <a href="https://vantageailabs.lovable.app" style="color: #d4a574;">vantageailabs.lovable.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BlueprintRequest = await req.json();
    const { email } = data;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the Supabase URL and key from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Call the send-email function
    const emailHtml = generateBlueprintEmailHtml(data);
    
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        toName: data.name || undefined,
        subject: "Your Custom BOS Blueprint from Vantage AI Labs",
        htmlBody: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-bos-blueprint:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
