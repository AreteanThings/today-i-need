
import TaskEntryHeader from "./TaskEntryHeader";
import TaskEntryForm from "./TaskEntryForm";
import { useCallback } from "react";

interface TaskEntryProps {
  onClose: () => void;
  editingTask?: any;
}

const TaskEntry = ({ onClose, editingTask }: TaskEntryProps) => {
  // Helper to handle cancel (for both header and form)
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Helper to handle successful task creation/update
  const handleSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <TaskEntryHeader onCancel={handleCancel} editingTask={editingTask} />
        {/* Form */}
        <div className="p-4 space-y-6">
          <TaskEntryForm 
            onCancel={handleCancel} 
            editingTask={editingTask}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskEntry;
