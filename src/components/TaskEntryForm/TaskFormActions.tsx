
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share, UserPlus } from 'lucide-react';

interface TaskFormActionsProps {
  onCancel: () => void;
  onShare?: () => void;
  isEditing: boolean;
  onCustomRepeat: () => void;
  repeatValue: string;
  showShareButton?: boolean;
}

const TaskFormActions = ({ 
  onCancel, 
  onShare, 
  isEditing, 
  onCustomRepeat, 
  repeatValue,
  showShareButton = true 
}: TaskFormActionsProps) => {
  return (
    <div className="space-y-4">
      {/* Custom Repeat Button */}
      {repeatValue === "custom" && (
        <Button
          type="button"
          variant="outline"
          onClick={onCustomRepeat}
          className="w-full"
        >
          Configure Custom Repeat
        </Button>
      )}

      {/* Share Button - Only show for new tasks or if explicitly enabled */}
      {showShareButton && !isEditing && onShare && (
        <Button
          type="button"
          variant="outline"
          onClick={onShare}
          className="w-full flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Share or Assign Task
        </Button>
      )}

      {/* Submit and Cancel Buttons */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {isEditing ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </div>
  );
};

export default TaskFormActions;
