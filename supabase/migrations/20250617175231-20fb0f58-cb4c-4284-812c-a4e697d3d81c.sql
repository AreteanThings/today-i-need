
-- Enable RLS on all tables and add comprehensive policies

-- RLS policies for tasks table
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

-- RLS policies for task_completions table
CREATE POLICY "Users can view their own task completions" ON public.task_completions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own task completions" ON public.task_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own task completions" ON public.task_completions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own task completions" ON public.task_completions
  FOR DELETE USING (user_id = auth.uid());

-- RLS policies for shared_contacts table
CREATE POLICY "Users can view their own shared contacts" ON public.shared_contacts
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own shared contacts" ON public.shared_contacts
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own shared contacts" ON public.shared_contacts
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own shared contacts" ON public.shared_contacts
  FOR DELETE USING (owner_id = auth.uid());

-- RLS policies for task_shares table
CREATE POLICY "Users can view shares for their own tasks" ON public.task_shares
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert shares for their own tasks" ON public.task_shares
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update shares for their own tasks" ON public.task_shares
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete shares for their own tasks" ON public.task_shares
  FOR DELETE USING (owner_id = auth.uid());

-- Enable realtime for tasks and task_completions tables
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_completions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_active ON public.tasks(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_user ON public.task_completions(task_id, user_id);
CREATE INDEX IF NOT EXISTS idx_shared_contacts_owner ON public.shared_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_owner ON public.task_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_task ON public.task_shares(task_id);
