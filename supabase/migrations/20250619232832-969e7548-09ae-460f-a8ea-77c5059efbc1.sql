
-- Create user connections table to track relationships between users
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_email TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(requester_id, target_email)
);

-- Create task assignments table to track who tasks are shared/assigned to
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  assigner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignee_email TEXT NOT NULL,
  assignee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT CHECK (assignment_type IN ('shared', 'assigned')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(task_id, assignee_email)
);

-- Create invitation emails log for tracking sent invitations
CREATE TABLE public.invitation_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.user_connections(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.task_assignments(id) ON DELETE CASCADE,
  email_type TEXT CHECK (email_type IN ('task_invitation', 'user_connection')) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connections
CREATE POLICY "Users can view their own connections" ON public.user_connections
  FOR SELECT USING (
    requester_id = auth.uid() OR 
    target_user_id = auth.uid()
  );

CREATE POLICY "Users can create their own connections" ON public.user_connections
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update connections they're part of" ON public.user_connections
  FOR UPDATE USING (
    requester_id = auth.uid() OR 
    target_user_id = auth.uid()
  );

-- RLS policies for task_assignments
CREATE POLICY "Users can view assignments for their tasks or assigned to them" ON public.task_assignments
  FOR SELECT USING (
    assigner_id = auth.uid() OR 
    assignee_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_assignments.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assignments for their own tasks" ON public.task_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assignments they created or are assigned to" ON public.task_assignments
  FOR UPDATE USING (
    assigner_id = auth.uid() OR 
    assignee_user_id = auth.uid()
  );

-- RLS policies for invitation_emails
CREATE POLICY "Users can view their sent invitations" ON public.invitation_emails
  FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can create their own invitations" ON public.invitation_emails
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX idx_user_connections_target_email ON public.user_connections(target_email);
CREATE INDEX idx_user_connections_target_user ON public.user_connections(target_user_id);
CREATE INDEX idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_assigner ON public.task_assignments(assigner_id);
CREATE INDEX idx_task_assignments_assignee_email ON public.task_assignments(assignee_email);
CREATE INDEX idx_task_assignments_assignee_user ON public.task_assignments(assignee_user_id);
CREATE INDEX idx_invitation_emails_sender ON public.invitation_emails(sender_id);
CREATE INDEX idx_invitation_emails_recipient ON public.invitation_emails(recipient_email);

-- Enable realtime for new tables
ALTER TABLE public.user_connections REPLICA IDENTITY FULL;
ALTER TABLE public.task_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.invitation_emails REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitation_emails;

-- Function to automatically link pending assignments when user signs up
CREATE OR REPLACE FUNCTION public.link_pending_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_connections when someone signs up with a pending invitation
  UPDATE public.user_connections 
  SET target_user_id = NEW.id, 
      status = 'accepted',
      accepted_at = now()
  WHERE target_email = NEW.email 
    AND target_user_id IS NULL 
    AND status = 'pending';
  
  -- Update task_assignments when someone signs up with pending task invitations
  UPDATE public.task_assignments 
  SET assignee_user_id = NEW.id,
      status = 'accepted',
      accepted_at = now()
  WHERE assignee_email = NEW.email 
    AND assignee_user_id IS NULL 
    AND status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically link assignments when user signs up
CREATE TRIGGER on_user_signup_link_assignments
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_pending_assignments();
