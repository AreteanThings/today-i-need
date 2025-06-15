
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
      
      // For regular tasks, use the task ID as-is and today's date
      // For overdue tasks, the taskId might be in format "taskId-date" from TodayList
      let actualTaskId = taskId;
      let completedDate = today;
      
      // Only split if this looks like an overdue task ID (ends with a date pattern)
      if (isOverdue && taskId.includes('-')) {
        // Check if the taskId ends with a date pattern (YYYY-MM-DD)
        const datePattern = /(\d{4}-\d{2}-\d{2})$/;
        const match = taskId.match(datePattern);
        
        if (match) {
          // Extract the date from the end
          completedDate = match[1];
          // Remove the date suffix to get the actual task ID
          actualTaskId = taskId.substring(0, taskId.length - match[1].length - 1); // -1 for the hyphen
        }
        // If it doesn't match date pattern, treat the whole string as task ID
      }

      console.log('Marking task done:', { taskId, actualTaskId, completedDate, isOverdue });

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
