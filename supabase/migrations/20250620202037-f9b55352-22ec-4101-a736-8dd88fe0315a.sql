
-- Fix RLS policies that are missing or incorrect

-- First, ensure all tables have proper RLS policies for the authenticated user

-- Fix tasks table policies (these seem to be missing from the current setup)
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

-- Fix task_completions policies (these seem to be missing)
DROP POLICY IF EXISTS "Users can view their own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can insert their own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can update their own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can delete their own task completions" ON public.task_completions;

CREATE POLICY "Users can view their own task completions" ON public.task_completions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own task completions" ON public.task_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own task completions" ON public.task_completions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own task completions" ON public.task_completions
  FOR DELETE USING (user_id = auth.uid());

-- Add missing policies for task_shares
DROP POLICY IF EXISTS "Users can view shares for their own tasks" ON public.task_shares;
DROP POLICY IF EXISTS "Users can insert shares for their own tasks" ON public.task_shares;
DROP POLICY IF EXISTS "Users can update shares for their own tasks" ON public.task_shares;
DROP POLICY IF EXISTS "Users can delete shares for their own tasks" ON public.task_shares;

CREATE POLICY "Users can view shares for their own tasks" ON public.task_shares
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert shares for their own tasks" ON public.task_shares
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update shares for their own tasks" ON public.task_shares
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete shares for their own tasks" ON public.task_shares
  FOR DELETE USING (owner_id = auth.uid());

-- Fix the task_assignments policies to allow users to see tasks assigned to them through completions
DROP POLICY IF EXISTS "Users can view assignments for their tasks or assigned to them" ON public.task_assignments;
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

-- Add policy to allow users to see completions for tasks assigned to them
DROP POLICY IF EXISTS "Users can view completions for assigned tasks" ON public.task_completions;
CREATE POLICY "Users can view completions for assigned tasks" ON public.task_completions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.task_assignments 
      WHERE task_assignments.task_id = task_completions.task_id 
      AND task_assignments.assignee_user_id = auth.uid()
      AND task_assignments.status = 'accepted'
    )
  );
