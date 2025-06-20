
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
    if (!user) return;
    
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

      if (assignmentsError) throw assignmentsError;

      // Get completions for these tasks
      const taskIds = assignments?.map(a => a.task_id) || [];
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .in('task_id', taskIds);

      if (completionsError) throw completionsError;

      // Transform assignments to tasks format
      const tasks: Task[] = (assignments || []).map(assignment => {
        const task = assignment.tasks;
        const taskCompletions = (completions || [])
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
          // Add assignment info with proper type casting
          assignmentType: assignment.assignment_type as 'shared' | 'assigned',
          assignedBy: assignment.assigner_id,
        };
      });

      setAssignedTasks(tasks);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssignedTasks();
    }
  }, [user]);

  // Set up real-time subscription for assignment changes with improved cleanup
  useEffect(() => {
    if (!user) return;

    let channel = supabase.channel(`assigned-tasks-${user.id}-${Date.now()}`);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignments',
          filter: `assignee_user_id=eq.${user.id}`,
        },
        () => {
          console.log('Task assignment changed, refetching...');
          fetchAssignedTasks();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up assigned tasks channel');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    assignedTasks,
    loading,
    refetch: fetchAssignedTasks,
  };
};
