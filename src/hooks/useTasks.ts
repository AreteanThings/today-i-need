import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Task {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  startDate: string;
  endDate?: string;
  repeatValue: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  isShared: boolean;
  isActive: boolean;
  createdAt: string;
  completedDates: { date: string; completedAt: string; completedBy: string }[];
}

// Utility function to make sure repeatValue is valid
const asRepeatValue = (val: any): Task["repeatValue"] => {
  if (["daily", "weekly", "monthly", "yearly", "custom"].includes(val)) {
    return val as Task["repeatValue"];
  }
  return "daily"; // fallback value
};

export const useTasks = () => {
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
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (tasksError) throw tasksError;

      // Fetch task completions
      const { data: completionsData, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      // Combine tasks with their completions
      const tasksWithCompletions = (tasksData || []).map(task => ({
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
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
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

      // Add to local state
      const newTask: Task = {
        id: data.id,
        category: data.category,
        title: data.title,
        subtitle: data.subtitle,
        startDate: data.start_date,
        endDate: data.end_date,
        repeatValue: data.repeat_value,
        isShared: data.is_shared,
        isActive: data.is_active,
        createdAt: data.created_at,
        completedDates: [],
      };

      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
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

      const { error } = await supabase
        .from('task_completions')
        .upsert({
          task_id: actualTaskId,
          user_id: user.id,
          completed_date: completedDate,
          completed_at: now,
        });

      if (error) throw error;

      // Update local state
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
      const { error } = await supabase
        .from('task_completions')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) throw error;

      // Update local state
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

  const isTaskDueOnDate = (task: Task, date: Date): boolean => {
    const startDate = new Date(task.startDate);
    const endDate = task.endDate ? new Date(task.endDate) : null;
    
    if (date < startDate) return false;
    if (endDate && date > endDate) return false;
    
    const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (task.repeatValue) {
      case "daily":
        return true;
      case "weekly":
        return daysDiff % 7 === 0;
      case "monthly":
        return date.getDate() === startDate.getDate();
      case "yearly":
        return date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate();
      case "custom":
        return daysDiff % 1 === 0;
      default:
        return false;
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
