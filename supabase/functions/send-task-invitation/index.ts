
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
    const { 
      recipient_email, 
      task_id, 
      assignment_id,
      sender_name,
      task_title,
      assignment_type = "shared"
    }: TaskInvitationRequest = await req.json();

    // Initialize Supabase client to fetch missing data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let finalTaskTitle = task_title;
    let finalSenderName = sender_name;

    // Fetch task details if not provided
    if (!finalTaskTitle && task_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', task_id)
        .single();
      
      if (task) {
        finalTaskTitle = task.title;
      }
    }

    // Fetch sender details if not provided
    if (!finalSenderName && assignment_id) {
      const { data: assignment } = await supabase
        .from('task_assignments')
        .select('assigner_id')
        .eq('id', assignment_id)
        .single();
      
      if (assignment) {
        const { data: user } = await supabase.auth.admin.getUserById(assignment.assigner_id);
        if (user?.user?.email) {
          finalSenderName = user.user.email;
        }
      }
    }

    const appUrl = "https://pdtswpdmbokckjdbmxnh.supabase.co";
    const acceptUrl = `${appUrl}/accept-invitation?assignment=${assignment_id}`;

    const actionText = assignment_type === 'shared' ? 'shared' : 'assigned';
    const description = assignment_type === 'shared' 
      ? 'This task will appear in both your and the sender\'s Today list.'
      : 'This task has been assigned to you and will appear in your Today list.';

    const emailResponse = await resend.emails.send({
      from: "TaskApp <onboarding@resend.dev>",
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
    });

    console.log("Task invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-task-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
