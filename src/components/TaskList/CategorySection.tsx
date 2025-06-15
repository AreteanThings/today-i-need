
import React from "react";
import { Task } from "@/types/task";
import CategoryBadge from "../CategoryBadge";
import TaskItem from "./TaskItem";
import { sortTasksByPriority } from "@/utils/taskUtils";

interface CategorySectionProps {
  category: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onViewHistory: (task: Task) => void;
}

const CategorySection = ({ category, tasks, onEditTask, onDeleteTask, onViewHistory }: CategorySectionProps) => {
  const sortedTasks = sortTasksByPriority(tasks);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <CategoryBadge category={category} />
        <span className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CategorySection);
