
import { Task } from "@/types/task";
import {
  insertTaskToSupabase,
  updateTaskInSupabase,
  softDeleteTaskInSupabase,
} from '../useTasks.supa';
import { withRetry, isNetworkError } from '@/utils/retryUtil';
import {
  validateTaskTitle,
  validateTaskCategory,
  validateDateRange,
} from '@/utils/validation';
import { TaskCrudSharedProps, TaskBaseInput } from "./taskCrud.types";
import { asRepeatValue } from "../useTasks.utils";

/**
 * Handles add, update, delete Task operations.
 */
export const useMutateTasks = ({
  tasks,
  setTasks,
  user,
  toast,
  setGlobalLoading,
  fetchTasks,
}: TaskCrudSharedProps & { fetchTasks: () => Promise<void> }) => {
  /** Add a new task after validation - now returns the created task */
  const addTask = async (taskData: TaskBaseInput): Promise<Task | undefined> => {
    if (!user) return;

    // Clean up date fields - convert empty strings to null/undefined
    const cleanedTaskData = {
      ...taskData,
      endDate: taskData.endDate && taskData.endDate.trim() !== '' ? taskData.endDate : undefined,
      subtitle: taskData.subtitle && taskData.subtitle.trim() !== '' ? taskData.subtitle : undefined,
      customRrule: taskData.customRrule && taskData.customRrule.trim() !== '' ? taskData.customRrule : undefined,
      customRruleText: taskData.customRruleText && taskData.customRruleText.trim() !== '' ? taskData.customRruleText : undefined,
    };

    // Validation
    const tv = validateTaskTitle(cleanedTaskData.title);
    const cv = validateTaskCategory(cleanedTaskData.category);
    const dv = validateDateRange(cleanedTaskData.startDate, cleanedTaskData.endDate);

    if (!tv.isValid || !cv.isValid || !dv.isValid) {
      const allErrs = [...tv.errors, ...cv.errors, ...dv.errors];
      toast({
        title: "Validation Error",
        description: allErrs.join(', '),
        variant: "destructive",
      });
      throw new Error(allErrs.join(', '));
    }

    try {
      setGlobalLoading('addTask', true);
      const data = await withRetry(
        () => insertTaskToSupabase(cleanedTaskData, user.id),
        { maxAttempts: 2 }
      );

      // Construct Task w/ completedDates
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
      setTasks(prev => [...prev, newTask]);
      await fetchTasks();
      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      });
      
      return newTask; // Return the created task
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error Creating Task",
        description: "Problem creating your task. Please check your input and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGlobalLoading('addTask', false);
    }
  };

  /** Update existing task properties after validation */
  const updateTask = async (
    id: string,
    updates: Partial<Task> & { customRrule?: string; customRruleText?: string }
  ) => {
    if (!user) return;

    // Clean up date fields - convert empty strings to null/undefined
    const cleanedUpdates = {
      ...updates,
      endDate: updates.endDate && updates.endDate.trim() !== '' ? updates.endDate : undefined,
      subtitle: updates.subtitle && updates.subtitle.trim() !== '' ? updates.subtitle : undefined,
      customRrule: updates.customRrule && updates.customRrule.trim() !== '' ? updates.customRrule : undefined,
      customRruleText: updates.customRruleText && updates.customRruleText.trim() !== '' ? updates.customRruleText : undefined,
    };

    if (cleanedUpdates.title) {
      const tv = validateTaskTitle(cleanedUpdates.title);
      if (!tv.isValid) {
        toast({
          title: "Validation Error",
          description: tv.errors.join(', '),
          variant: "destructive",
        });
        throw new Error(tv.errors.join(', '));
      }
    }
    if (cleanedUpdates.category) {
      const cv = validateTaskCategory(cleanedUpdates.category);
      if (!cv.isValid) {
        toast({
          title: "Validation Error",
          description: cv.errors.join(', '),
          variant: "destructive",
        });
        throw new Error(cv.errors.join(', '));
      }
    }
    try {
      setGlobalLoading(`updateTask-${id}`, true);
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? { ...task, ...cleanedUpdates }
            : task
        )
      );
      await withRetry(
        () => updateTaskInSupabase(id, cleanedUpdates, user.id),
        { maxAttempts: 2 }
      );
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      await fetchTasks();
      toast({
        title: "Error Updating Task",
        description: "Failed to update your task. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGlobalLoading(`updateTask-${id}`, false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      setGlobalLoading(`deleteTask-${id}`, true);
      setTasks(prev => prev.filter(t => t.id !== id));
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
      await fetchTasks();
      toast({
        title: "Error Deleting Task",
        description: "Failed to delete your task. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGlobalLoading(`deleteTask-${id}`, false);
    }
  };

  return { addTask, updateTask, deleteTask };
};
