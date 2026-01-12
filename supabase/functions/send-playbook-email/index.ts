import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaybookRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PlaybookRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending playbook email to: ${email}`);

    // Generate the playbook HTML content
    const playbookHtml = generatePlaybookEmailHtml(email);

    // Call the send-email function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const sendEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your Small Business AI Playbook is Here!',
        htmlBody: playbookHtml,
      }),
    });

    if (!sendEmailResponse.ok) {
      const errorText = await sendEmailResponse.text();
      console.error('Failed to send email:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await sendEmailResponse.json();
    console.log('Playbook email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in send-playbook-email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate the full playbook email HTML
function generatePlaybookEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Small Business AI Playbook</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080b12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f1219; border: 1px solid #1e2432;">
    
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <img src="https://cketdqusxoymxbrxbkez.supabase.co/storage/v1/object/public/assets/vantage-logo-white.png" alt="Vantage AI Labs" style="height: 40px; width: auto;" onerror="this.style.display='none'">
        <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 10px 0 0 0; letter-spacing: 0.5px;">VANTAGE AI LABS</p>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        The Small Business AI Playbook
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Your practical guide to implementing AI without the fluff
      </p>
    </div>

    <!-- Welcome Section -->
    <div style="padding: 30px;">
      <p style="color: #f8fafc; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hey there!
      </p>
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
        Thanks for grabbing The Small Business AI Playbook from <strong style="color: #0ea5e9;">Vantage AI Labs</strong>. This isn't another "AI is the future" fluff piece - it's a practical, no-BS guide to implementing AI tools that will actually save you time and money.
      </p>
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
        Let's dive in.
      </p>
    </div>

    <!-- Section 1: 7 AI Tools -->
    <div style="padding: 0 30px 30px 30px;">
      <div style="background-color: #151a24; border: 1px solid #1e2432; border-radius: 12px; padding: 25px;">
        <h2 style="color: #0ea5e9; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
          Section 1: 7 AI Tools You Can Implement This Week
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            1. ChatGPT or Claude for Customer Email Drafting
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 5+ hours/week<br>
            Use AI to draft responses to customer inquiries, complaints, and follow-ups. Provide context about your business tone and watch it generate responses in seconds.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            2. Calendly + AI Scheduling Assistant
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 3+ hours/week<br>
            Stop the back-and-forth email dance for scheduling meetings. Set up smart availability rules and let clients book directly.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            3. Otter.ai for Meeting Transcription
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 2+ hours/week<br>
            Never miss action items again. Otter joins your calls, transcribes everything, and generates summaries with key takeaways.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            4. Notion AI for SOPs & Documentation
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 4+ hours/week<br>
            Create standard operating procedures 10x faster. Describe your process in rough notes, and Notion AI formats it professionally.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            5. Jasper or Copy.ai for Marketing Content
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 6+ hours/week<br>
            Generate social posts, ad copy, email newsletters, and blog outlines. Provide your brand voice and let AI do the first draft.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            6. Zapier AI for Workflow Automation
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 5+ hours/week<br>
            Connect your apps and automate repetitive tasks. New lead? Auto-add to email sequence. Invoice paid? Auto-update spreadsheet.
          </p>
        </div>

        <div>
          <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            7. Grammarly Business for Professional Communication
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong style="color: #f59e0b;">Time saved:</strong> 2+ hours/week<br>
            Ensure every email and proposal is polished. AI catches errors and keeps your team's tone consistent.
          </p>
        </div>
      </div>
    </div>

    <!-- Section 2: ROI Calculations -->
    <div style="padding: 0 30px 30px 30px;">
      <div style="background-color: #151a24; border: 1px solid #1e2432; border-radius: 12px; padding: 25px;">
        <h2 style="color: #0ea5e9; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
          Section 2: Real ROI Calculations
        </h2>
        
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Here's what implementing just 3-4 of these tools looks like for a typical small business:
        </p>

        <div style="background: linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0.05) 100%); border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #f8fafc; font-size: 14px; line-height: 1.8; margin: 0;">
            <strong>Time Saved:</strong> 20+ hours/week<br>
            <strong>At $50/hour:</strong> $4,000/month saved<br>
            <strong>Annual Impact:</strong> $48,000+ in recovered productivity<br>
            <strong>Tool Costs:</strong> ~$200-500/month<br>
            <strong style="color: #f59e0b;">Net Savings: $42,000-46,000/year</strong>
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong style="color: #f8fafc;">Calculate Your Own ROI:</strong><br>
          (Hours saved per week) x (Your hourly value) x 52 weeks - (Monthly tool costs x 12) = Your Annual AI ROI
        </p>
      </div>
    </div>

    <!-- Section 3: Implementation Checklist -->
    <div style="padding: 0 30px 30px 30px;">
      <div style="background-color: #151a24; border: 1px solid #1e2432; border-radius: 12px; padding: 25px;">
        <h2 style="color: #0ea5e9; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
          Section 3: 4-Week Implementation Checklist
        </h2>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
            Week 1: Audit Your Current Processes
          </h3>
          <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>List every task you do repeatedly each week</li>
            <li>Track time spent on each task</li>
            <li>Identify the top 5 time-wasters</li>
            <li>Note which tasks are rule-based vs. creative</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
            Week 2: Select Your First 2-3 Tools
          </h3>
          <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Match tools to your biggest pain points</li>
            <li>Sign up for free trials</li>
            <li>Watch setup tutorials</li>
            <li>Set up one tool completely before moving to the next</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
            Week 3: Implement and Train Your Team
          </h3>
          <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Create simple how-to guides for your team</li>
            <li>Do a 30-minute training session per tool</li>
            <li>Assign an "AI Champion" on your team</li>
            <li>Set up feedback channels for issues</li>
          </ul>
        </div>

        <div>
          <h3 style="color: #f8fafc; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
            Week 4: Measure and Optimize
          </h3>
          <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Track actual time saved vs. expected</li>
            <li>Identify adoption blockers</li>
            <li>Refine prompts and workflows</li>
            <li>Plan your next tool implementation</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Section 4: Common Mistakes -->
    <div style="padding: 0 30px 30px 30px;">
      <div style="background-color: #151a24; border: 1px solid #1e2432; border-radius: 12px; padding: 25px;">
        <h2 style="color: #0ea5e9; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
          Section 4: 5 Common Mistakes to Avoid
        </h2>

        <div style="margin-bottom: 15px;">
          <p style="color: #f8fafc; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">
            1. Trying to automate everything at once
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            Start with 1-2 tools. Master them. Then expand.
          </p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="color: #f8fafc; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">
            2. Not training your team properly
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            Invest 30 minutes in proper training to avoid 30 hours of frustration.
          </p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="color: #f8fafc; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">
            3. Ignoring data privacy considerations
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            Choose enterprise-grade tools with proper data handling policies.
          </p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="color: #f8fafc; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">
            4. Choosing tools without a clear use case
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            "It looks cool" isn't a strategy. Every tool should solve a specific problem.
          </p>
        </div>

        <div>
          <p style="color: #f8fafc; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">
            5. Not measuring ROI
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
            Track time saved and results achieved to justify expanding your AI toolkit.
          </p>
        </div>
      </div>
    </div>

    <!-- Section 5: Next Steps CTA -->
    <div style="padding: 0 30px 40px 30px;">
      <div style="background: linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0.05) 100%); border: 1px solid #0ea5e9; border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="color: #f8fafc; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">
          Ready to Get Personalized AI Recommendations?
        </h2>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
          Take our free 2-minute AI Readiness Assessment to discover exactly which tools will have the biggest impact on YOUR business.
        </p>
        <a href="https://vantageailabs.com/assessment" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Take the Free Assessment
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0 0;">
          Or <a href="https://vantageailabs.com/#booking" style="color: #0ea5e9; text-decoration: underline;">book a free strategy call</a> to discuss your specific needs.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #080b12; padding: 25px 30px; border-top: 1px solid #1e2432; text-align: center;">
      <p style="color: #0ea5e9; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">
        VANTAGE AI LABS
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 15px 0;">
        AI Automation for Small Business
      </p>
      <p style="color: #475569; font-size: 12px; margin: 0;">
        You're receiving this because you signed up for The Small Business AI Playbook.<br>
        <a href="https://vantageailabs.com" style="color: #475569;">vantageailabs.com</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
