
import { Task } from "@/types/task";
import { useFetchTasks } from './useFetchTasks';
import { useMutateTasks } from './useMutateTasks';
import { TaskCrudSharedProps } from './taskCrud.types';

export const useTaskCrud = ({
  tasks,
  setTasks,
  user,
  toast,
  setGlobalLoading,
  setLoading
}: TaskCrudSharedProps) => {
  // Only pass setLoading to fetchTasks, omit for others
  const { fetchTasks } = useFetchTasks({
    setTasks,
    user,
    toast,
    setGlobalLoading,
    setLoading: setLoading!,
  });

  const { addTask, updateTask, deleteTask } = useMutateTasks({
    tasks,
    setTasks,
    user,
    toast,
    setGlobalLoading,
    fetchTasks,
  });

  return {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};
