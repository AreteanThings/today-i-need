
import { Task } from "@/types/task";
import {
  markTaskDoneInSupabase,
  undoTaskDoneInSupabase,
} from '../useTasks.supa';
import { withRetry, isNetworkError } from '@/utils/retryUtil';

interface TaskCompletionProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: any;
  toast: any;
  setGlobalLoading: (key: string, loading: boolean) => void;
  fetchTasks: () => Promise<void>;
}

export const useTaskCompletion = ({
  tasks,
  setTasks,
  user,
  toast,
  setGlobalLoading,
  fetchTasks
}: TaskCompletionProps) => {

  const markTaskDone = async (taskId: string, isOverdue = false) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      setGlobalLoading(`markDone-${taskId}`, true);
      
      // Get the task to determine the actual task ID (remove overdue suffix if present)
      const actualTaskId = taskId.includes('-') ? taskId.split('-')[0] : taskId;
      const completedDate = isOverdue ? taskId.split('-')[1] || today : today;

      // Optimistically update UI
      setTasks(prev => prev.map(task => {
        if (task.id === actualTaskId) {
          const newCompletedDates = task.completedDates.filter(cd => cd.date !== completedDate);
          newCompletedDates.push({
            date: completedDate,
            completedAt: now,
            completedBy: "You"
          });
          return {
            ...task,
            completedDates: newCompletedDates
          };
        }
        return task;
      }));

      await withRetry(
        () => markTaskDoneInSupabase(actualTaskId, user.id, completedDate, now),
        { maxAttempts: 2 }
      );

      toast({
        title: "Task Completed",
        description: "Great job! Task marked as complete.",
      });
    } catch (error) {
      console.error('Error marking task done:', error);
      
      // Revert optimistic update
      await fetchTasks();
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to mark task as complete. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Completing Task",
          description: "Failed to mark task as complete. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setGlobalLoading(`markDone-${taskId}`, false);
    }
  };

  const undoTaskDone = async (taskId: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    try {
      setGlobalLoading(`undoTask-${taskId}`, true);
      
      // Optimistically update UI
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            completedDates: task.completedDates.filter(cd => cd.date !== today)
          };
        }
        return task;
      }));

      await withRetry(
        () => undoTaskDoneInSupabase(taskId, user.id, today),
        { maxAttempts: 2 }
      );

      toast({
        title: "Task Uncompleted",
        description: "Task marked as incomplete.",
      });
    } catch (error) {
      console.error('Error undoing task:', error);
      
      // Revert optimistic update
      await fetchTasks();
      
      if (isNetworkError(error)) {
        toast({
          title: "Connection Error",
          description: "Unable to undo task completion. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Undoing Task",
          description: "Failed to undo task completion. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setGlobalLoading(`undoTask-${taskId}`, false);
    }
  };

  return {
    markTaskDone,
    undoTaskDone,
  };
};
