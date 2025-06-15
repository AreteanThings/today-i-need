import { Task } from "@/types/task";
import { asRepeatValue } from '../useTasks.utils';
import {
  fetchTasksFromSupabase,
  insertTaskToSupabase,
  updateTaskInSupabase,
  softDeleteTaskInSupabase,
} from '../useTasks.supa';
import { withRetry, isNetworkError } from '@/utils/retryUtil';
import { validateTaskTitle, validateTaskCategory, validateDateRange } from '@/utils/validation';
import { repairCustomRrule } from "@/utils/repairCustomRrule";

interface TaskCrudProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: any;
  toast: any;
  setGlobalLoading: (key: string, loading: boolean) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTaskCrud = ({
  tasks,
  setTasks,
  user,
  toast,
  setGlobalLoading,
  setLoading
}: TaskCrudProps) => {

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setGlobalLoading('fetchTasks', true);
      const tasksWithCompletions = await withRetry(
        () => fetchTasksFromSupabase(user.id),
        { maxAttempts: 3 }
      );
      
      // AUTO-REPAIR customRrule for all custom repeat tasks
      const patchedTasks = tasksWithCompletions.map(task => {
        if (task.repeatValue === "custom" && task.customRrule) {
          const repaired = repairCustomRrule(task.customRrule);
          return { ...task, customRrule: repaired };
        }
        return task;
      });
      setTasks(patchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Loading Tasks",
          description: "Failed to load your tasks. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setGlobalLoading('fetchTasks', false);
    }
  };

  const addTask = async (taskData: Omit<Task, "id" | "isActive" | "createdAt" | "completedDates">) => {
    if (!user) return;

    // Validate input
    const titleValidation = validateTaskTitle(taskData.title);
    const categoryValidation = validateTaskCategory(taskData.category);
    const dateValidation = validateDateRange(taskData.startDate, taskData.endDate);

    if (!titleValidation.isValid || !categoryValidation.isValid || !dateValidation.isValid) {
      const allErrors = [...titleValidation.errors, ...categoryValidation.errors, ...dateValidation.errors];
      toast({
        title: "Validation Error",
        description: allErrors.join(', '),
        variant: "destructive",
      });
      throw new Error(allErrors.join(', '));
    }

    try {
      setGlobalLoading('addTask', true);
      const data = await withRetry(
        () => insertTaskToSupabase(taskData, user.id),
        { maxAttempts: 2 }
      );
      
      const newTask: Task = {
        id: data.id,
        category: data.category,
        title: data.title,
        subtitle: data.subtitle,
        startDate: data.start_date,
        endDate: data.end_date,
        repeatValue: asRepeatValue(data.repeat_value),
        isShared: data.is_shared,
        isActive: data.is_active,
        createdAt: data.created_at,
        completedDates: [],
        customRrule: data.custom_rrule,
        customRruleText: data.custom_rrule_text,
      };
      
      // Optimistically update UI
      setTasks(prev => [...prev, newTask]);
      console.log('addTask: Inserted new task & updating local state:', newTask);

      // Refetch for consistency
      await fetchTasks();
      
      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to create task. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Creating Task",
          description: "Failed to create your task. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setGlobalLoading('addTask', false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task> & { customRrule?: string; customRruleText?: string }) => {
    if (!user) return;

    // Validate input if title or category is being updated
    if (updates.title) {
      const titleValidation = validateTaskTitle(updates.title);
      if (!titleValidation.isValid) {
        toast({
          title: "Validation Error",
          description: titleValidation.errors.join(', '),
          variant: "destructive",
        });
        throw new Error(titleValidation.errors.join(', '));
      }
    }

    if (updates.category) {
      const categoryValidation = validateTaskCategory(updates.category);
      if (!categoryValidation.isValid) {
        toast({
          title: "Validation Error",
          description: categoryValidation.errors.join(', '),
          variant: "destructive",
        });
        throw new Error(categoryValidation.errors.join(', '));
      }
    }

    try {
      setGlobalLoading(`updateTask-${id}`, true);
      
      // Optimistically update UI
      setTasks(prev => prev.map(task =>
        task.id === id
          ? {
              ...task,
              ...updates,
              repeatValue: updates.repeatValue
                ? asRepeatValue(updates.repeatValue)
                : task.repeatValue,
            }
          : task
      ));

      await withRetry(
        () => updateTaskInSupabase(id, updates, user.id),
        { maxAttempts: 2 }
      );

      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Revert optimistic update
      await fetchTasks();
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to update task. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Updating Task",
          description: "Failed to update your task. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setGlobalLoading(`updateTask-${id}`, false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      setGlobalLoading(`deleteTask-${id}`, true);
      
      // Optimistically update UI
      setTasks(prev => prev.filter(task => task.id !== id));

      await withRetry(
        () => softDeleteTaskInSupabase(id, user.id),
        { maxAttempts: 2 }
      );

      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Revert optimistic update
      await fetchTasks();
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to delete task. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Deleting Task",
          description: "Failed to delete your task. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setGlobalLoading(`deleteTask-${id}`, false);
    }
  };

  return {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};
