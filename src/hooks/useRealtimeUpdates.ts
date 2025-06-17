
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { useAuth } from './useAuth';
import { asRepeatValue } from './useTasks.utils';

interface UseRealtimeUpdatesProps {
  onTasksUpdate: (tasks: Task[]) => void;
  fetchTasks: () => Promise<void>;
}

export const useRealtimeUpdates = ({ onTasksUpdate, fetchTasks }: UseRealtimeUpdatesProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Tasks realtime update:', payload);
          // Refresh tasks when any change occurs
          fetchTasks();
        }
      )
      .subscribe();

    // Subscribe to task completions changes
    const completionsChannel = supabase
      .channel('completions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Task completions realtime update:', payload);
          // Refresh tasks when completions change
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [user, fetchTasks]);
};
