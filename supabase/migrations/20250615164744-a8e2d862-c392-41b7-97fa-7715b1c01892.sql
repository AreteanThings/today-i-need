
-- Create a table to store task sharing info
CREATE TABLE public.task_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (task_id, contact_email)
);

-- Enable Row Level Security
ALTER TABLE public.task_shares ENABLE ROW LEVEL SECURITY;

-- Only allow owner of the task to read shares
CREATE POLICY "Task owner can select their shares"
  ON public.task_shares
  FOR SELECT
  USING (owner_id = auth.uid());

-- Only allow owner of the task to insert shares
CREATE POLICY "Task owner can insert shares"
  ON public.task_shares
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Only allow owner of the task to delete shares
CREATE POLICY "Task owner can delete shares"
  ON public.task_shares
  FOR DELETE
  USING (owner_id = auth.uid());
