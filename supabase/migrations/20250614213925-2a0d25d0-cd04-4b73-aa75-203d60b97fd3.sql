
-- Create the 'tasks' table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  subtitle text,
  start_date date NOT NULL,
  end_date date,
  repeat_value text NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create the 'task_completions' table
CREATE TABLE IF NOT EXISTS public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  completed_date date NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can access only their own tasks
CREATE POLICY "Select own tasks" ON public.tasks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own tasks" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own tasks" ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

-- RLS policy: users can access only their own completions
CREATE POLICY "Select own task completions" ON public.task_completions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert own task completions" ON public.task_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own task completions" ON public.task_completions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own task completions" ON public.task_completions
  FOR DELETE USING (user_id = auth.uid());
