
-- Add custom_rrule and custom_rrule_text columns to the tasks table
ALTER TABLE public.tasks 
ADD COLUMN custom_rrule TEXT,
ADD COLUMN custom_rrule_text TEXT;
