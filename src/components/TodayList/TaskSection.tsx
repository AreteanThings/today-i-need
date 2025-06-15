
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Undo2 } from "lucide-react";
import { formatRelativeDate, formatRelativeDateTime } from "@/utils/dateUtils";
import CategoryBadge from "../CategoryBadge";
import { Task } from "@/types/task";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  type: 'active' | 'done' | 'overdue';
  hiddenOverdueTasks: Set<string>;
  onMarkDone: (taskId: string, isOverdue?: boolean) => void;
  onUndo: (taskId: string) => void;
}

const TaskSection = ({ 
  title, 
  tasks, 
  type,
  hiddenOverdueTasks,
  onMarkDone,
  onUndo
}: TaskSectionProps) => {
  // Filter out hidden overdue tasks
  const filteredTasks = type === 'overdue' 
    ? tasks.filter(task => !hiddenOverdueTasks.has(task.id))
    : tasks;

  if (filteredTasks.length === 0) return null;

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

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
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      type === 'done' 
                        ? 'bg-muted/50 text-muted-foreground border-muted' 
                        : type === 'overdue'
                        ? 'border-destructive bg-destructive/5'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.subtitle && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.subtitle}
                          </p>
                        )}
                        
                        {/* Completion info for done tasks */}
                        {type === 'done' && task.completedDates && task.completedDates.length > 0 && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatRelativeDateTime(task.completedDates[task.completedDates.length - 1].completedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.completedDates[task.completedDates.length - 1].completedBy || 'You'}</span>
                            </div>
                            {/* Show if this was an overdue task that got completed */}
                            {(task as any).wasOverdue && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-green-600">Overdue task completed</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Due date for overdue tasks */}
                        {type === 'overdue' && task.startDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {formatRelativeDate(task.startDate)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-3">
                        {type === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => onMarkDone(task.id)}
                            className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          >
                            Done
                          </Button>
                        )}
                        {type === 'done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUndo(task.id)}
                            className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all"
                          >
                            <Undo2 className="h-3 w-3 mr-1" />
                            Undo
                          </Button>
                        )}
                        {type === 'overdue' && (
                          <Button
                            size="sm"
                            onClick={() => onMarkDone(task.id, true)}
                            className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TaskSection;
