
import { Task } from "@/types/task";
import { fetchTasksFromSupabase } from '../useTasks.supa';
import { withRetry, isNetworkError } from '@/utils/retryUtil';
import { repairCustomRrule } from "@/utils/repairCustomRrule";
import { TaskFetchProps } from "./taskCrud.types";

/**
 * Hook for fetching all tasks from Supabase and updating state.
 */
export const useFetchTasks = ({
  setTasks,
  user,
  toast,
  setGlobalLoading,
  setLoading,
}: TaskFetchProps) => {
  const fetchTasks = async () => {
    if (!user) return;
    try {
      setGlobalLoading('fetchTasks', true);
      const fetchedTasks = await withRetry(
        () => fetchTasksFromSupabase(user.id),
        { maxAttempts: 3 }
      );
      // AUTO-REPAIR customRrule for all custom repeat tasks
      const patched = fetchedTasks.map(task =>
        task.repeatValue === "custom" && task.customRrule
          ? { ...task, customRrule: repairCustomRrule(task.customRrule) }
          : task
      );
      setTasks(patched);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      const desc = isNetworkError(error)
        ? "Unable to connect to the server. Please check your internet connection and try again."
        : "Failed to load your tasks. Please try again.";
      toast({
        title: "Error Loading Tasks",
        description: desc,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGlobalLoading('fetchTasks', false);
    }
  };
  return { fetchTasks };
};
