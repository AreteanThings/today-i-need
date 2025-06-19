
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { UserConnection, TaskAssignment, TaskSharingData } from '@/types/sharing';

export const useTaskSharing = () => {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user connections
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle database string types vs TypeScript union types
      const typedConnections = (data || []).map(conn => ({
        ...conn,
        status: conn.status as 'pending' | 'accepted' | 'declined'
      })) as UserConnection[];
      
      setConnections(typedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // Create or get existing connection
  const createConnection = async (email: string): Promise<UserConnection | null> => {
    if (!user) return null;

    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('user_connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('target_email', email)
        .single();

      if (existing) {
        return {
          ...existing,
          status: existing.status as 'pending' | 'accepted' | 'declined'
        } as UserConnection;
      }

      // Create new connection
      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          target_email: email,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConnections();
      
      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined'
      } as UserConnection;
    } catch (error) {
      console.error('Error creating connection:', error);
      return null;
    }
  };

  // Share or assign task
  const shareTask = async (taskId: string, sharingData: TaskSharingData) => {
    if (!user) return;

    setLoading(true);
    try {
      // First get the task details for the email
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', taskId)
        .single();

      const assignments = [];
      
      for (const email of sharingData.selectedEmails) {
        // Create connection if it doesn't exist
        await createConnection(email);
        
        // Create task assignment
        const { data: assignment, error } = await supabase
          .from('task_assignments')
          .insert({
            task_id: taskId,
            assigner_id: user.id,
            assignee_email: email,
            assignment_type: sharingData.assignmentType,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating assignment:', error);
          continue;
        }

        // Type assertion for database response
        const typedAssignment = {
          ...assignment,
          assignment_type: assignment.assignment_type as 'shared' | 'assigned',
          status: assignment.status as 'pending' | 'accepted' | 'declined'
        } as TaskAssignment;

        assignments.push(typedAssignment);

        // Send invitation email with proper task and sender info
        await sendTaskInvitation(email, taskId, assignment.id, taskData?.title, user.email);
      }

      toast({
        title: "Task Shared Successfully",
        description: `Task has been ${sharingData.assignmentType} with ${sharingData.selectedEmails.length} user(s).`,
      });

      return assignments;
    } catch (error) {
      console.error('Error sharing task:', error);
      toast({
        title: "Error Sharing Task",
        description: "Failed to share the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send task invitation email with proper data
  const sendTaskInvitation = async (email: string, taskId: string, assignmentId: string, taskTitle?: string, senderEmail?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-task-invitation', {
        body: {
          recipient_email: email,
          task_id: taskId,
          assignment_id: assignmentId,
          sender_name: senderEmail,
          task_title: taskTitle,
          assignment_type: 'shared', // Default, could be made dynamic
        },
      });

      if (error) throw error;

      // Log the invitation
      await supabase
        .from('invitation_emails')
        .insert({
          sender_id: user?.id,
          recipient_email: email,
          task_id: taskId,
          assignment_id: assignmentId,
          email_type: 'task_invitation',
        });
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  // Get task assignments for a specific task
  const getTaskAssignments = async (taskId: string): Promise<TaskAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('task_id', taskId);

      if (error) throw error;
      
      // Type assertion for database response
      const typedAssignments = (data || []).map(assignment => ({
        ...assignment,
        assignment_type: assignment.assignment_type as 'shared' | 'assigned',
        status: assignment.status as 'pending' | 'accepted' | 'declined'
      })) as TaskAssignment[];
      
      return typedAssignments;
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  return {
    connections,
    loading,
    shareTask,
    createConnection,
    getTaskAssignments,
    fetchConnections,
  };
};
