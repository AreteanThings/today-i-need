
import { Task } from "@/types/task";
import { useTaskCrud } from './useTaskOperations/taskCrud';
import { useTaskCompletion } from './useTaskOperations/taskCompletion';

interface UseTaskOperationsProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: any;
  toast: any;
  setGlobalLoading: (key: string, loading: boolean) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTaskOperations = ({
  tasks,
  setTasks,
  user,
  toast,
  setGlobalLoading,
  setLoading
}: UseTaskOperationsProps) => {

  const taskCrud = useTaskCrud({
    tasks,
    setTasks,
    user,
    toast,
    setGlobalLoading,
    setLoading
  });

  const taskCompletion = useTaskCompletion({
    tasks,
    setTasks,
    user,
    toast,
    setGlobalLoading,
    fetchTasks: taskCrud.fetchTasks
  });

  return {
    ...taskCrud,
    ...taskCompletion,
  };
};
