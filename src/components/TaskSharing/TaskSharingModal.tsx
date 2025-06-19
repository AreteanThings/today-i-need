import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Mail } from 'lucide-react';
import { useTaskSharing } from '@/hooks/useTaskSharing';
import { TaskSharingData } from '@/types/sharing';

interface TaskSharingModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (sharingData: TaskSharingData) => void;
  taskTitle: string;
}

const TaskSharingModal = ({ open, onClose, onShare, taskTitle }: TaskSharingModalProps) => {
  const { connections, loading } = useTaskSharing();
  const [assignmentType, setAssignmentType] = useState<'shared' | 'assigned'>('shared');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  const handleAddEmail = () => {
    if (newEmail && !selectedEmails.includes(newEmail)) {
      setSelectedEmails([...selectedEmails, newEmail]);
      setNewEmail('');
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email));
  };

  const handleSelectConnection = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleShare = () => {
    if (selectedEmails.length === 0) return;
    
    onShare({
      assignmentType,
      selectedEmails,
    });
    
    // Reset form
    setSelectedEmails([]);
    setNewEmail('');
    setIsAddingEmail(false);
    onClose();
  };

  const acceptedConnections = connections.filter(conn => conn.status === 'accepted');
  const pendingConnections = connections.filter(conn => conn.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Task: {taskTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Type Selection */}
          <div>
            <Label className="text-sm font-medium">Assignment Type</Label>
            <RadioGroup
              value={assignmentType}
              onValueChange={(value) => setAssignmentType(value as 'shared' | 'assigned')}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shared" id="shared" />
                <Label htmlFor="shared" className="text-sm">
                  <strong>Share:</strong> Task appears in both your and recipient's Today list
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="assigned" id="assigned" />
                <Label htmlFor="assigned" className="text-sm">
                  <strong>Assign:</strong> Task appears in your Task list, recipient's Today list
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Selected Emails */}
          {selectedEmails.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Selected Recipients</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEmails.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveEmail(email)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Existing Connections */}
          {acceptedConnections.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Your Connections</Label>
              <div className="space-y-2 mt-2">
                {acceptedConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectConnection(connection.target_email)}
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span className="text-sm">{connection.target_email}</span>
                      <Badge variant="outline" className="text-xs">Connected</Badge>
                    </div>
                    {selectedEmails.includes(connection.target_email) && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Connections */}
          {pendingConnections.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Pending Invitations</Label>
              <div className="space-y-2 mt-2">
                {pendingConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-2 border rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{connection.target_email}</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Email */}
          {isAddingEmail ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Add New Recipient</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button onClick={handleAddEmail} disabled={!newEmail}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => setIsAddingEmail(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAddingEmail(true)}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Recipient
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedEmails.length === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Sharing...' : `${assignmentType === 'shared' ? 'Share' : 'Assign'} Task`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskSharingModal;
