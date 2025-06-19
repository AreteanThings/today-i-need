
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TaskInvitationRequest {
  recipient_email: string;
  task_id: string;
  assignment_id: string;
  sender_name?: string;
  task_title?: string;
  assignment_type?: 'shared' | 'assigned';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== TASK INVITATION EMAIL FUNCTION STARTED ===");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    
    // Check environment variables
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Environment check:");
    console.log("- RESEND_API_KEY exists:", !!resendKey);
    console.log("- RESEND_API_KEY length:", resendKey?.length || 0);
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    
    if (!resendKey) {
      console.error("❌ RESEND_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Email service not configured - missing RESEND_API_KEY" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Database service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log("Raw request body:", rawBody);
      requestBody = JSON.parse(rawBody);
      console.log("Parsed request body:", requestBody);
    } catch (error) {
      console.error("❌ Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { 
      recipient_email, 
      task_id, 
      assignment_id,
      sender_name,
      task_title,
      assignment_type = "shared"
    }: TaskInvitationRequest = requestBody;

    console.log("Extracted data:");
    console.log("- recipient_email:", recipient_email);
    console.log("- task_id:", task_id);
    console.log("- assignment_id:", assignment_id);
    console.log("- sender_name:", sender_name);
    console.log("- task_title:", task_title);
    console.log("- assignment_type:", assignment_type);

    if (!recipient_email || !task_id || !assignment_id) {
      console.error("❌ Missing required fields:", { recipient_email: !!recipient_email, task_id: !!task_id, assignment_id: !!assignment_id });
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipient_email, task_id, or assignment_id" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    console.log("🔗 Initializing Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let finalTaskTitle = task_title;
    let finalSenderName = sender_name;

    // Fetch task details if not provided
    if (!finalTaskTitle && task_id) {
      console.log("📋 Fetching task details for task_id:", task_id);
      try {
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .select('title')
          .eq('id', task_id)
          .single();
        
        if (taskError) {
          console.error("❌ Error fetching task:", taskError);
        } else if (task) {
          finalTaskTitle = task.title;
          console.log("✅ Fetched task title:", finalTaskTitle);
        } else {
          console.log("⚠️ No task found with id:", task_id);
        }
      } catch (error) {
        console.error("❌ Exception while fetching task:", error);
      }
    }

    // Fetch sender details if not provided
    if (!finalSenderName && assignment_id) {
      console.log("👤 Fetching sender details for assignment_id:", assignment_id);
      try {
        const { data: assignment, error: assignmentError } = await supabase
          .from('task_assignments')
          .select('assigner_id')
          .eq('id', assignment_id)
          .single();
        
        if (assignmentError) {
          console.error("❌ Error fetching assignment:", assignmentError);
        } else if (assignment) {
          console.log("✅ Found assigner_id:", assignment.assigner_id);
          
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(assignment.assigner_id);
            if (userError) {
              console.error("❌ Error fetching user:", userError);
            } else if (userData?.user?.email) {
              finalSenderName = userData.user.email;
              console.log("✅ Fetched sender email:", finalSenderName);
            } else {
              console.log("⚠️ No email found for user:", assignment.assigner_id);
            }
          } catch (error) {
            console.error("❌ Exception while fetching user:", error);
          }
        } else {
          console.log("⚠️ No assignment found with id:", assignment_id);
        }
      } catch (error) {
        console.error("❌ Exception while fetching assignment:", error);
      }
    }

    // Prepare email content
    const appUrl = "https://pdtswpdmbokckjdbmxnh.supabase.co";
    const acceptUrl = `${appUrl}/accept-invitation?assignment=${assignment_id}`;
    
    const actionText = assignment_type === 'shared' ? 'shared' : 'assigned';
    const description = assignment_type === 'shared' 
      ? 'This task will appear in both your and the sender\'s Today list.'
      : 'This task has been assigned to you and will appear in your Today list.';

    // IMPORTANT: Change this to your verified domain!
    // For now using the test domain - you MUST replace this with your verified domain
    const fromEmail = "TaskApp <hello@yourdomain.com>"; // ← REPLACE WITH YOUR VERIFIED DOMAIN
    
    const emailData = {
      from: fromEmail,
      to: [recipient_email],
      subject: `You've been ${assignment_type === 'shared' ? 'invited to collaborate on' : 'assigned'} a task: ${finalTaskTitle || 'a task'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Task ${assignment_type === 'shared' ? 'Collaboration' : 'Assignment'} Invitation</h1>
          
          <p>Hi there!</p>
          
          <p><strong>${finalSenderName || 'Someone'}</strong> has ${actionText} a task with you:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">${finalTaskTitle || 'a task'}</h3>
          </div>
          
          <p style="color: #666; font-size: 14px;">${description}</p>
          
          <div style="margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept ${assignment_type === 'shared' ? 'Collaboration' : 'Assignment'}
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you don't have an account yet, you'll be prompted to create one when you click the link above.
            Once you sign up, all your ${assignment_type === 'shared' ? 'shared' : 'assigned'} tasks will automatically appear in your account.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    console.log("📧 Email payload prepared:");
    console.log("- From:", emailData.from);
    console.log("- To:", emailData.to);
    console.log("- Subject:", emailData.subject);
    console.log("- Accept URL:", acceptUrl);

    // Test Resend connection first
    console.log("🔍 Testing Resend connection...");
    try {
      // Try to get domain info to test API key
      console.log("📡 Attempting to send email via Resend...");
      const emailResponse = await resend.emails.send(emailData);
      
      console.log("📬 Resend API response:", JSON.stringify(emailResponse, null, 2));

      if (emailResponse.error) {
        console.error("❌ Resend API returned an error:", emailResponse.error);
        
        // Provide specific error guidance
        let errorMessage = "Failed to send email";
        let errorDetails = emailResponse.error;
        
        if (typeof emailResponse.error === 'object' && emailResponse.error.message) {
          const errorMsg = emailResponse.error.message.toLowerCase();
          if (errorMsg.includes('domain') || errorMsg.includes('verify')) {
            errorMessage = "Domain not verified. Please verify your domain in Resend dashboard.";
            errorDetails = "Go to https://resend.com/domains to verify your domain";
          } else if (errorMsg.includes('api') || errorMsg.includes('key')) {
            errorMessage = "Invalid API key. Please check your RESEND_API_KEY.";
          } else if (errorMsg.includes('from')) {
            errorMessage = "Invalid 'from' email address. Must use verified domain.";
          }
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            details: errorDetails,
            resendResponse: emailResponse,
            troubleshooting: {
              step1: "Verify your domain at https://resend.com/domains",
              step2: "Check your API key at https://resend.com/api-keys",
              step3: "Ensure 'from' email uses your verified domain"
            }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log("✅ Email sent successfully! Email ID:", emailResponse.data?.id);

      return new Response(JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        message: "Task invitation email sent successfully"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } catch (emailError: any) {
      console.error("💥 Error sending email:", emailError);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email via Resend", 
          message: emailError.message,
          details: emailError,
          troubleshooting: {
            checkApiKey: "Verify RESEND_API_KEY is correct",
            checkDomain: "Verify domain at https://resend.com/domains",
            checkFromEmail: "Ensure 'from' email uses verified domain"
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("💥 CRITICAL ERROR in send-task-invitation function:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
