
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { useTodayTasks } from "@/hooks/useTodayTasks";
import { TaskActionsProvider } from "@/contexts/TaskActionsContext";
import TaskSection from "./TodayList/TaskSection";
import TodayHeader from "./TodayList/TodayHeader";
import EmptyState from "./TodayList/EmptyState";

interface TodayListProps {
  onEditTask: (task: Task) => void;
}

const TodayList = ({ onEditTask }: TodayListProps) => {
  const { tasks, markTaskDone, undoTaskDone } = useTasks();
  const { toast } = useToast();
  const [hiddenOverdueTasks, setHiddenOverdueTasks] = useState<Set<string>>(new Set());

  const { active, done, overdue } = useTodayTasks(tasks, hiddenOverdueTasks);

  const handleMarkDone = (taskId: string, isOverdue = false) => {
    markTaskDone(taskId, isOverdue);
    toast({
      title: "Task Completed",
      description: "Task marked as done!",
    });

    // If it's an overdue task, hide it after 10 seconds
    if (isOverdue) {
      setTimeout(() => {
        setHiddenOverdueTasks(prev => new Set(prev).add(taskId));
      }, 10000);
    }
  };

  const handleUndo = (taskId: string) => {
    undoTaskDone(taskId);
    // Remove from hidden set if it was there
    setHiddenOverdueTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    toast({
      title: "Task Restored",
      description: "Task moved back to active.",
    });
  };

  // Calculate total active tasks for today
  const totalActiveTasks = active.length + overdue.filter(task => !hiddenOverdueTasks.has(task.id)).length;

  return (
    <TaskActionsProvider onMarkDone={handleMarkDone} onUndo={handleUndo}>
      <div className="p-4 pb-20">
        <TodayHeader totalActiveTasks={totalActiveTasks} />

        <TaskSection 
          title="Active" 
          tasks={active} 
          type="active" 
        />
        <TaskSection 
          title="Done" 
          tasks={done} 
          type="done" 
        />
        <TaskSection 
          title="Overdue" 
          tasks={overdue.filter(task => !hiddenOverdueTasks.has(task.id))} 
          type="overdue" 
        />
        
        {active.length === 0 && done.length === 0 && overdue.filter(task => !hiddenOverdueTasks.has(task.id)).length === 0 && (
          <EmptyState />
        )}
      </div>
    </TaskActionsProvider>
  );
};

export default TodayList;
