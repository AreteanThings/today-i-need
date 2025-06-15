
import { Task } from "@/types/task";

/** Props shared by task CRUD hooks */
export interface TaskCrudSharedProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: { id: string } | null;
  toast: (args: { title: string; description: string; variant?: string }) => void;
  setGlobalLoading: (key: string, loading: boolean) => void;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TaskFetchProps extends Omit<TaskCrudSharedProps, 'setLoading'> {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// For add/update mutation input
export type TaskBaseInput = Omit<
  Task,
  "id" | "isActive" | "createdAt" | "completedDates"
>;
