
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Task } from "@/types/task";
import { asRepeatValue, isTaskDueOnDate } from './useTasks.utils';
import {
  fetchTasksFromSupabase,
  insertTaskToSupabase,
  updateTaskInSupabase,
  softDeleteTaskInSupabase,
  markTaskDoneInSupabase,
  undoTaskDoneInSupabase,
} from './useTasks.supa';

export const useTasksCore = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load tasks from Supabase
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    fetchTasks();
    // eslint-disable-next-line
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const tasksWithCompletions = await fetchTasksFromSupabase(user.id);
      setTasks(tasksWithCompletions);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error Loading Tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, "id" | "isActive" | "createdAt" | "completedDates">) => {
    if (!user) return;
    try {
      const data = await insertTaskToSupabase(taskData, user.id);
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
      };
      setTasks(prev => [...prev, newTask]);
      console.log('addTask: Inserted new task & updating local state:', newTask);

      // Immediately refetch the full tasks list to ensure consistency
      await fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task> & { customRrule?: string }) => {
    if (!user) return;
    try {
      await updateTaskInSupabase(id, updates, user.id);
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
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await softDeleteTaskInSupabase(id, user.id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const markTaskDone = async (taskId: string, isOverdue = false) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      // Get the task to determine the actual task ID (remove overdue suffix if present)
      const actualTaskId = taskId.includes('-') ? taskId.split('-')[0] : taskId;
      const completedDate = isOverdue ? taskId.split('-')[1] || today : today;

      await markTaskDoneInSupabase(actualTaskId, user.id, completedDate, now);

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
    } catch (error) {
      console.error('Error marking task done:', error);
      throw error;
    }
  };

  const undoTaskDone = async (taskId: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      await undoTaskDoneInSupabase(taskId, user.id, today);
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            completedDates: task.completedDates.filter(cd => cd.date !== today)
          };
        }
        return task;
      }));
    } catch (error) {
      console.error('Error undoing task:', error);
      throw error;
    }
  };

  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const active: any[] = [];
    const done: any[] = [];
    const overdue: any[] = [];
    
    tasks.forEach(task => {
      if (!task.isActive) return;
      
      const isDueToday = isTaskDueOnDate(task, today);
      
      if (isDueToday) {
        const todayCompletion = task.completedDates.find(cd => cd.date === todayStr);
        
        if (todayCompletion) {
          done.push({
            ...task,
            completedAt: todayCompletion.completedAt,
            completedBy: todayCompletion.completedBy
          });
        } else {
          active.push(task);
        }
      }
      
      const startDate = new Date(task.startDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (startDate < today) {
        let checkDate = new Date(Math.max(startDate.getTime(), startDate.getTime()));
        
        while (checkDate <= yesterday) {
          if (isTaskDueOnDate(task, checkDate)) {
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const completion = task.completedDates.find(cd => cd.date === checkDateStr);
            
            if (!completion) {
              overdue.push({
                ...task,
                dueDate: checkDate.toISOString(),
                id: `${task.id}-${checkDateStr}`
              });
            }
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    });
    
    return { active, done, overdue };
  };

  const categories = [...new Set(tasks.map(task => task.category))].filter(Boolean);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    markTaskDone,
    undoTaskDone,
    getTodayTasks,
    categories,
  };
};
