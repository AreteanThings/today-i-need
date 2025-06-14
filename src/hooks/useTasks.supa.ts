
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { asRepeatValue } from "./useTasks.utils";

// All async functions that handle Supabase DB queries
export const fetchTasksFromSupabase = async (userId: string) => {
  // Fetch tasks
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (tasksError) throw tasksError;

  // Fetch task completions
  const { data: completionsData, error: completionsError } = await supabase
    .from('task_completions')
    .select('*')
    .eq('user_id', userId);

  if (completionsError) throw completionsError;

  // Combine tasks with their completions
  const tasksWithCompletions: Task[] = (tasksData || []).map(task => ({
    id: task.id,
    category: task.category,
    title: task.title,
    subtitle: task.subtitle,
    startDate: task.start_date,
    endDate: task.end_date,
    repeatValue: asRepeatValue(task.repeat_value),
    isShared: task.is_shared,
    isActive: task.is_active,
    createdAt: task.created_at,
    completedDates: (completionsData || [])
      .filter(completion => completion.task_id === task.id)
      .map(completion => ({
        date: completion.completed_date,
        completedAt: completion.completed_at,
        completedBy: "You"
      }))
  }));

  return tasksWithCompletions;
};

export const insertTaskToSupabase = async (taskData: Omit<Task, "id" | "isActive" | "createdAt" | "completedDates">, userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      category: taskData.category,
      title: taskData.title,
      subtitle: taskData.subtitle,
      start_date: taskData.startDate,
      end_date: taskData.endDate,
      repeat_value: taskData.repeatValue,
      is_shared: taskData.isShared,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTaskInSupabase = async (id: string, updates: Partial<Task>, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      category: updates.category,
      title: updates.title,
      subtitle: updates.subtitle,
      start_date: updates.startDate,
      end_date: updates.endDate,
      repeat_value: updates.repeatValue,
      is_shared: updates.isShared,
      updated_at: new Date().toISOString(),  // Now this column exists, so no error!
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const softDeleteTaskInSupabase = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const markTaskDoneInSupabase = async (taskId: string, userId: string, completedDate: string, now: string) => {
  const { error } = await supabase
    .from('task_completions')
    .upsert({
      task_id: taskId,
      user_id: userId,
      completed_date: completedDate,
      completed_at: now,
    });

  if (error) throw error;
};

export const undoTaskDoneInSupabase = async (taskId: string, userId: string, completedDate: string) => {
  const { error } = await supabase
    .from('task_completions')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .eq('completed_date', completedDate);

  if (error) throw error;
};
