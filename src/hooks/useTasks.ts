
import { useTasksCore } from "./useTasksCore";
import { useAssignedTasks } from "./useAssignedTasks";

export const useTasks = () => {
  const coreHooks = useTasksCore();
  const { assignedTasks, loading: assignedLoading } = useAssignedTasks();
  
  // Merge assigned tasks with user's own tasks for Today view
  const allTasks = [...coreHooks.tasks, ...assignedTasks];
  
  return {
    ...coreHooks,
    allTasks, // Tasks including assigned ones for Today view
    assignedTasks, // Only assigned tasks
    assignedLoading,
  };
};
