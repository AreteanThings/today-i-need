
export interface UserConnection {
  id: string;
  requester_id: string;
  target_email: string;
  target_user_id?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  accepted_at?: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigner_id: string;
  assignee_email: string;
  assignee_user_id?: string;
  assignment_type: 'shared' | 'assigned';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  accepted_at?: string;
}

export interface InvitationEmail {
  id: string;
  sender_id: string;
  recipient_email: string;
  task_id?: string;
  connection_id?: string;
  assignment_id?: string;
  email_type: 'task_invitation' | 'user_connection';
  sent_at: string;
  opened_at?: string;
  accepted_at?: string;
}

export interface TaskSharingData {
  assignmentType: 'shared' | 'assigned';
  selectedEmails: string[];
}
