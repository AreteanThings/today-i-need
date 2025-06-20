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
  /** Add a new task after validation */
  const addTask = async (taskData: TaskBaseInput) => {
    if (!user) return;

    // Validation
    const tv = validateTaskTitle(taskData.title);
    const cv = validateTaskCategory(taskData.category);
    const dv = validateDateRange(taskData.startDate, taskData.endDate);

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
        () => insertTaskToSupabase(taskData, user.id),
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
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error Creating Task",
        description: "Problem creating your task.",
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

    if (updates.title) {
      const tv = validateTaskTitle(updates.title);
      if (!tv.isValid) {
        toast({
          title: "Validation Error",
          description: tv.errors.join(', '),
          variant: "destructive",
        });
        throw new Error(tv.errors.join(', '));
      }
    }
    if (updates.category) {
      const cv = validateTaskCategory(updates.category);
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
            ? { ...task, ...updates }
            : task
        )
      );
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

  /** Soft delete a task */
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
