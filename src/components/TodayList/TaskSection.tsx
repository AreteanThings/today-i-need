
import React from "react";
import CategoryBadge from "../CategoryBadge";
import TodayTaskItem, { TodayTask, TaskType } from "./TodayTaskItem";
import { useTaskActions } from "@/contexts/TaskActionsContext";

interface TaskSectionProps {
  title: string;
  tasks: TodayTask[];
  type: TaskType;
}

const TaskSection = ({ title, tasks, type }: TaskSectionProps) => {
  const { onMarkDone, onUndo } = useTaskActions();

  if (tasks.length === 0) return null;

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, TodayTask[]>);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-foreground">{title}</h2>
      {Object.entries(groupedTasks)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, categoryTasks]) => (
          <div key={category} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={category} />
              <span className="text-sm text-muted-foreground">
                {categoryTasks.length} {categoryTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="space-y-2">
              {categoryTasks
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((task) => (
                  <TodayTaskItem
                    key={task.id}
                    task={task}
                    type={type}
                    onMarkDone={onMarkDone}
                    onUndo={onUndo}
                  />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TaskSection;
