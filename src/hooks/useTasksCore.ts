
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { Task } from "@/types/task";
import { asRepeatValue, isTaskDueOnDate } from './useTasks.utils';
import { useTaskOperations } from './useTaskOperations';
import { useTaskFilters } from './useTaskFilters';
import { useRealtimeUpdates } from './useRealtimeUpdates';

export const useTasksCore = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { setLoading: setGlobalLoading, isLoading } = useLoading();

  const taskOperations = useTaskOperations({
    tasks,
    setTasks,
    user,
    toast,
    setGlobalLoading,
    setLoading
  });

  const taskFilters = useTaskFilters(tasks);

  // Set up real-time updates
  useRealtimeUpdates({
    onTasksUpdate: setTasks,
    fetchTasks: taskOperations.fetchTasks
  });

  // Load tasks from Supabase
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    taskOperations.fetchTasks();
    // eslint-disable-next-line
  }, [user]);

  const categories = [...new Set(tasks.map(task => task.category))].filter(Boolean);

  return {
    tasks,
    loading,
    ...taskOperations,
    ...taskFilters,
    categories,
    isLoading,
  };
};
