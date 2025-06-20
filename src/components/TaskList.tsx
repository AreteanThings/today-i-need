
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import CategorySection from "./TaskList/CategorySection";

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

const TaskList = ({ onEditTask }: TaskListProps) => {
  const { tasks, deleteTask } = useTasks();
  const { toast } = useToast();

  const activeTasks = tasks.filter(task => task.isActive);
  console.log("TaskList - All tasks:", tasks);
  console.log("TaskList - Active tasks:", activeTasks);

  const handleDelete = (task: Task) => {
    deleteTask(task.id);
    toast({
      title: "Task Deleted",
      description: task.isShared 
        ? "Task has been removed for everyone." 
        : "Task has been deleted.",
    });
  };

  // Group tasks by category
  const groupedTasks = activeTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  console.log("TaskList - Grouped tasks:", groupedTasks);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
        <p className="text-muted-foreground">
          {activeTasks.length} active {activeTasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks yet!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first task to get started.
          </p>
        </div>
      ) : (
        Object.entries(groupedTasks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryTasks]) => (
            <CategorySection
              key={category}
              category={category}
              tasks={categoryTasks}
              onEditTask={onEditTask}
              onDeleteTask={handleDelete}
            />
          ))
      )}
    </div>
  );
};

export default TaskList;
