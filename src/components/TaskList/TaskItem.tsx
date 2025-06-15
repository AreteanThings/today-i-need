
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Task } from "@/types/task";
import { getTaskDisplayInfo } from "@/utils/taskUtils";
import { formatDisplayDate } from "@/utils/dateHelpers";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onViewHistory: (task: Task) => void;
}

const TaskItem = ({ task, onEdit, onDelete, onViewHistory }: TaskItemProps) => {
  const displayInfo = getTaskDisplayInfo(task);

  // Human readable repeat description
  let repeatDesc: React.ReactNode = (
    <span>Repeats: {task.repeatValue}</span>
  );
  
  if (task.repeatValue === "custom") {
    if (task.customRruleText) {
      // Use the saved human-readable text
      repeatDesc = (
        <span>Repeats: {task.customRruleText}</span>
      );
    } else if (task.customRrule && task.customRrule.trim()) {
      // Fallback to showing the raw rule if no text was saved
      repeatDesc = (
        <span>
          Repeats:{" "}
          <span className="font-mono text-xs text-muted-foreground">
            {task.customRrule}
          </span>
        </span>
      );
    } else {
      repeatDesc = (
        <span>
          Repeats:{" "}
          <span className="text-orange-600 italic">
            custom (needs configuration)
          </span>
        </span>
      );
    }
  }

  const dateToShow = displayInfo.overdueDateStr || displayInfo.nextDueDate;
  const dueDisplay = dateToShow ? (
    <span className={displayInfo.statusClass}>
      {displayInfo.statusText}: {formatDisplayDate(dateToShow)}
    </span>
  ) : (
    <span className={displayInfo.statusClass}>{displayInfo.statusText}</span>
  );

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{task.title}</h3>
          {task.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {repeatDesc}
            {task.endDate && (
              <span>End: {formatDisplayDate(task.endDate)}</span>
            )}
            {task.isShared && (
              <span className="text-primary font-medium">Shared</span>
            )}
          </div>
          <div className="mt-2 text-xs">
            {dueDisplay}
          </div>
        </div>
        
        <div className="flex gap-2 ml-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewHistory(task)}
            className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
            title="See History"
          >
            <History className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
            className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  {task.isShared 
                    ? "This will remove it for everyone. Are you sure you want to delete this task?"
                    : "Are you sure you want to delete this task? This action cannot be undone."
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(task)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TaskItem);
