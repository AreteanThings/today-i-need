
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
import { getNextDueDate, getMostRecentOverdueDate } from "@/hooks/useTasks.utils";
import { getRRuleText } from "@/utils/getRRuleText";
import { repairCustomRrule } from "@/utils/repairCustomRrule";
import { formatRelativeDate } from "@/utils/dateUtils";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskItem = ({ task, onEdit, onDelete }: TaskItemProps) => {
  // Determine next due date and overdue info
  const overdueDateStr = getMostRecentOverdueDate(task);
  const nextDueDateStr = getNextDueDate(task);

  let dueDisplay = null;
  if (overdueDateStr) {
    dueDisplay = (
      <span className="text-destructive font-medium">
        Overdue: {formatRelativeDate(overdueDateStr)}
      </span>
    );
  } else if (nextDueDateStr) {
    dueDisplay = (
      <span>
        Next Due: {formatRelativeDate(nextDueDateStr)}
      </span>
    );
  } else {
    dueDisplay = (
      <span className="text-muted-foreground">No upcoming due dates</span>
    );
  }

  // Human readable repeat description (for "custom")
  let repeatDesc: React.ReactNode = (
    <span>Repeats: {task.repeatValue}</span>
  );
  
  if (task.repeatValue === "custom") {
    console.log("Processing custom task:", task.title, "customRrule:", task.customRrule);
    
    // Check if customRrule exists and is not empty
    if (task.customRrule && task.customRrule.trim()) {
      const repairedRule = repairCustomRrule(task.customRrule);
      let ruleText = getRRuleText(repairedRule);
      console.log("Repaired rule:", repairedRule, "Rule text:", ruleText);
      
      if (ruleText && ruleText.length > 0) {
        // Capitalize the first character if text is present
        ruleText = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);
        repeatDesc = (
          <span>
            Repeats:{" "}
            <span className="italic">{ruleText}</span>
          </span>
        );
      } else {
        // Show the raw rule if we can't parse it
        repeatDesc = (
          <span>
            Repeats:{" "}
            <span className="font-mono text-xs text-muted-foreground">
              {task.customRrule}
            </span>
          </span>
        );
      }
    } else {
      // No custom rule defined, show a more helpful message
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
              <span>End: {formatRelativeDate(task.endDate)}</span>
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
