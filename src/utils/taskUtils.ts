import { Task } from "@/types/task";
import { useTaskStatus } from "@/hooks/useTaskStatus";

// Re-export the hook functions as utility functions for backward compatibility
const { getTaskStatus, sortTasksByPriority } = (() => {
  const hookInstance = { 
    getTaskStatus: (task: Task, date: Date = new Date()) => {
      // This is a temporary implementation - ideally components should use the hook directly
      const { getTaskStatus } = useTaskStatus();
      return getTaskStatus(task, date);
    },
    sortTasksByPriority: (tasks: Task[]) => {
      const { sortTasksByPriority } = useTaskStatus();
      return sortTasksByPriority(tasks);
    }
  };
  return hookInstance;
})();

export { getTaskStatus, sortTasksByPriority };

// Keep the interfaces for backward compatibility
export type { TaskStatusInfo as TaskStatus } from "@/hooks/useTaskStatus";

export const getTaskDisplayInfo = (task: Task) => {
  return getTaskStatus(task);
};
