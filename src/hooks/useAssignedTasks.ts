
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Task } from '@/types/task';
import { asRepeatValue } from './useTasks.utils';

export const useAssignedTasks = () => {
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAssignedTasks = async () => {
    if (!user) {
      console.log('useAssignedTasks: No user, clearing tasks');
      setAssignedTasks([]);
      return;
    }
    
    console.log('useAssignedTasks: Fetching tasks for user:', user.id);
    setLoading(true);
    
    try {
      // Get tasks assigned to the current user
      const { data: assignments, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select(`
          *,
          tasks (*)
        `)
        .eq('assignee_user_id', user.id)
        .eq('status', 'accepted');

      if (assignmentsError) {
        console.error('useAssignedTasks: Error fetching assignments:', assignmentsError);
        setAssignedTasks([]);
        setLoading(false);
        return;
      }

      console.log('useAssignedTasks: Assignments fetched:', assignments?.length || 0);

      // Get completions for these tasks
      const taskIds = assignments?.map(a => a.task_id) || [];
      
      let completions = [];
      if (taskIds.length > 0) {
        const { data: completionsData, error: completionsError } = await supabase
          .from('task_completions')
          .select('*')
          .in('task_id', taskIds);

        if (completionsError) {
          console.error('useAssignedTasks: Error fetching completions:', completionsError);
          // Don't fail completely, just continue without completions
          completions = [];
        } else {
          completions = completionsData || [];
        }
      }

      // Transform assignments to tasks format
      const tasks: Task[] = (assignments || []).map(assignment => {
        const task = assignment.tasks;
        if (!task) {
          console.warn('useAssignedTasks: Assignment without task found:', assignment);
          return null;
        }

        const taskCompletions = completions
          .filter(c => c.task_id === task.id)
          .map(c => ({
            date: c.completed_date,
            completedAt: c.completed_at,
            completedBy: c.user_id === user.id ? 'You' : 'Other'
          }));

        return {
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
          completedDates: taskCompletions,
          customRrule: task.custom_rrule,
          customRruleText: task.custom_rrule_text,
          assignmentType: assignment.assignment_type as 'shared' | 'assigned',
          assignedBy: assignment.assigner_id,
        };
      }).filter(Boolean) as Task[];

      console.log('useAssignedTasks: Processed tasks:', tasks.length);
      setAssignedTasks(tasks);
    } catch (error) {
      console.error('useAssignedTasks: Unexpected error:', error);
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAssignedTasks: User changed:', user?.id || 'null');
    if (user) {
      fetchAssignedTasks();
    } else {
      setAssignedTasks([]);
    }
  }, [user?.id]); // Use user.id to prevent unnecessary re-runs

  // Set up real-time subscription for assignment changes
  useEffect(() => {
    if (!user?.id) {
      console.log('useAssignedTasks: No user for subscription');
      return;
    }

    console.log('useAssignedTasks: Setting up subscription for user:', user.id);
    
    const channelName = `assigned-tasks-${user.id}-${Date.now()}`;
    let channel = supabase.channel(channelName);
    
    try {
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_assignments',
            filter: `assignee_user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('useAssignedTasks: Assignment changed:', payload);
            // Use setTimeout to prevent potential blocking
            setTimeout(() => {
              fetchAssignedTasks();
            }, 100);
          }
        )
        .subscribe((status) => {
          console.log('useAssignedTasks: Subscription status:', status);
        });
    } catch (error) {
      console.error('useAssignedTasks: Error setting up subscription:', error);
    }

    return () => {
      console.log('useAssignedTasks: Cleaning up channel:', channelName);
      try {
        if (channel) {
          supabase.removeChannel(channel);
        }
      } catch (error) {
        console.error('useAssignedTasks: Error cleaning up channel:', error);
      }
    };
  }, [user?.id]);

  return {
    assignedTasks,
    loading,
    refetch: fetchAssignedTasks,
  };
};
