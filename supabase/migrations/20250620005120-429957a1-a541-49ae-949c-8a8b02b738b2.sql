
-- First, let's check what policies exist and drop/recreate if needed
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view assignments for their tasks or assigned to them" ON public.task_assignments;
DROP POLICY IF EXISTS "Users can create assignments for their own tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Users can update assignments they created or are assigned to" ON public.task_assignments;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update connections they're part of" ON public.user_connections;
DROP POLICY IF EXISTS "Users can view their sent invitations" ON public.invitation_emails;
DROP POLICY IF EXISTS "Users can create their own invitations" ON public.invitation_emails;
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.shared_contacts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.shared_contacts;

-- Now create the policies fresh
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

CREATE POLICY "Users can view their sent invitations" ON public.invitation_emails
  FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can create their own invitations" ON public.invitation_emails
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view their own contacts" ON public.shared_contacts
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can manage their own contacts" ON public.shared_contacts
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
