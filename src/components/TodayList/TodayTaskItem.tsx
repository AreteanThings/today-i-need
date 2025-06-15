
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Undo2 } from "lucide-react";
import { formatRelativeDateTime, formatRelativeDate } from "@/utils/dateUtils";
import { Task } from "@/types/task";

export interface TodayTask extends Task {
  completedAt?: string;
  completedBy?: string;
  dueDate?: string;
  wasOverdue?: boolean;
}

export type TaskType = 'active' | 'done' | 'overdue';

interface TodayTaskItemProps {
  task: TodayTask;
  type: TaskType;
  onMarkDone: (taskId: string, isOverdue?: boolean) => void;
  onUndo: (taskId: string) => void;
}

const TodayTaskItem = ({ task, type, onMarkDone, onUndo }: TodayTaskItemProps) => {
  const getTaskItemClassName = () => {
    const baseClass = "p-3 rounded-lg border";
    switch (type) {
      case 'done':
        return `${baseClass} bg-muted/50 text-muted-foreground border-muted`;
      case 'overdue':
        return `${baseClass} border-destructive bg-destructive/5`;
      default:
        return `${baseClass} bg-card border-border`;
    }
  };

  const renderCompletionInfo = () => {
    if (type !== 'done' || !task.completedDates?.length) return null;

    const latestCompletion = task.completedDates[task.completedDates.length - 1];
    
    return (
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {formatRelativeDateTime(latestCompletion.completedAt).replace('Today at', 'Done at')}
          </span>
        </div>
        {task.isShared && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{latestCompletion.completedBy || 'You'}</span>
          </div>
        )}
        {task.wasOverdue && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="text-green-600">Overdue</span>
          </div>
        )}
      </div>
    );
  };

  const renderOverdueDueDate = () => {
    if (type !== 'overdue' || !task.startDate) return null;

    return (
      <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
        <Calendar className="h-3 w-3" />
        <span>Due: {formatRelativeDate(task.startDate)}</span>
      </div>
    );
  };

  const renderActionButton = () => {
    switch (type) {
      case 'active':
        return (
          <Button
            size="sm"
            onClick={() => onMarkDone(task.id)}
            className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            Done
          </Button>
        );
      case 'done':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUndo(task.id)}
            className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Undo
          </Button>
        );
      case 'overdue':
        return (
          <Button
            size="sm"
            onClick={() => onMarkDone(task.id, true)}
            className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            Done
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getTaskItemClassName()}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium">{task.title}</h4>
          {task.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.subtitle}
            </p>
          )}
          {renderCompletionInfo()}
          {renderOverdueDueDate()}
        </div>
        <div className="ml-3">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

export default TodayTaskItem;
