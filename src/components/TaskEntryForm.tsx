
import React from "react";
import { Task } from "@/types/task";
import TaskFormContainer from "./TaskEntryForm/TaskFormContainer";

interface TaskEntryFormProps {
  editingTask?: Task;
  onCancel: () => void;
  onSuccess?: () => void;
}

const TaskEntryForm = ({ editingTask, onCancel, onSuccess }: TaskEntryFormProps) => {
  return (
    <TaskFormContainer
      editingTask={editingTask}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
};

export default TaskEntryForm;
