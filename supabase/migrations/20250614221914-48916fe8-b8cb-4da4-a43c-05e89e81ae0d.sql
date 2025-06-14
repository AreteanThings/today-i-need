
-- Add an updated_at column to the tasks table to support timestamping edits
ALTER TABLE public.tasks
  ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Optionally, update the default value to automatically update this column on each UPDATE (optional, and Postgres does not support this in DEFAULT, so you'll update it via the app code)

-- (No migration needed for task_completions table since error is for tasks)
