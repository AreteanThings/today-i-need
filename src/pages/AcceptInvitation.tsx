
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle, XCircle, UserPlus } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [task, setTask] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-accepted'>('loading');

  const assignmentId = searchParams.get('assignment');

  useEffect(() => {
    if (!assignmentId) {
      setStatus('error');
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [assignmentId, user]);

  const fetchInvitationDetails = async () => {
    try {
      // Fetch assignment details
      const { data: assignment, error: assignmentError } = await supabase
        .from('task_assignments')
        .select(`
          *,
          tasks (
            id,
            title,
            subtitle,
            category
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      setInvitation(assignment);
      setTask(assignment.tasks);

      // Check if already accepted
      if (assignment.status === 'accepted') {
        setStatus('already-accepted');
      } else if (assignment.status === 'declined') {
        setStatus('error');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setStatus('error');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !invitation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('task_assignments')
        .update({
          assignee_user_id: user.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (error) throw error;

      setStatus('success');
      toast({
        title: "Invitation Accepted!",
        description: `You've successfully accepted the ${invitation.assignment_type === 'shared' ? 'shared' : 'assigned'} task.`,
      });

      // Redirect to main app after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('task_assignments')
        .update({
          status: 'declined',
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Invitation Declined",
        description: "You have declined this task invitation.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this invitation. If you don't have an account, you can create one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error' || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'already-accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              You have already accepted this invitation. The task should appear in your task list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              You've successfully accepted the task. Redirecting to the app...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Task Invitation</CardTitle>
          <CardDescription>
            You've been invited to {invitation.assignment_type === 'shared' ? 'collaborate on' : 'work on'} a task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{task?.title}</h3>
            {task?.subtitle && (
              <p className="text-gray-600 mt-1">{task.subtitle}</p>
            )}
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {task?.category}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>
              <strong>Assignment Type:</strong> {invitation.assignment_type === 'shared' ? 'Shared Task' : 'Assigned Task'}
            </p>
            <p className="mt-1">
              {invitation.assignment_type === 'shared' 
                ? 'This task will appear in both your and the sender\'s task list.'
                : 'This task has been assigned to you and will appear in your task list.'
              }
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1" disabled={loading}>
              Accept
            </Button>
            <Button onClick={handleDecline} variant="outline" className="flex-1" disabled={loading}>
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
