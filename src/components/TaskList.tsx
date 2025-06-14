import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
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
import { getNextDueDate, getMostRecentOverdueDate } from "@/hooks/useTasks.utils";
import { getRRuleText, repairCustomRrule } from "@/utils/getRRuleText";

interface TaskListProps {
  onEditTask: (task: any) => void;
}

const TaskList = ({ onEditTask }: TaskListProps) => {
  const { tasks, deleteTask } = useTasks();
  const { toast } = useToast();
  const [deletingTask, setDeletingTask] = useState<any>(null);

  const activeTasks = tasks.filter(task => task.isActive);
  console.log("TaskList - All tasks:", tasks);
  console.log("TaskList - Active tasks:", activeTasks);

  const handleDelete = (task: any) => {
    deleteTask(task.id);
    toast({
      title: "Task Deleted",
      description: task.isShared 
        ? "Task has been removed for everyone." 
        : "Task has been deleted.",
    });
    setDeletingTask(null);
  };

  // Group tasks by category
  const groupedTasks = activeTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, any[]>);

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
            <div key={category} className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-foreground border-b border-border pb-1">
                {category}
              </h2>
              <div className="space-y-3">
                {categoryTasks
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((task) => {
                    // Determine next due date and overdue info
                    const overdueDateStr = getMostRecentOverdueDate(task);
                    const nextDueDateStr = getNextDueDate(task);

                    let dueDisplay = null;
                    if (overdueDateStr) {
                      dueDisplay = (
                        <span className="text-destructive font-medium">
                          Overdue: {new Date(overdueDateStr).toLocaleDateString()}
                        </span>
                      );
                    } else if (nextDueDateStr) {
                      dueDisplay = (
                        <span>
                          Next Due: {new Date(nextDueDateStr).toLocaleDateString()}
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
                      const repairedRule = repairCustomRrule(task.customRrule);
                      const ruleText = getRRuleText(repairedRule);
                      repeatDesc = (
                        <span>
                          Repeats:{" "}
                          <span className="italic">
                            {ruleText || (
                              <span className="text-destructive/80">
                                (invalid custom rule)
                              </span>
                            )}
                          </span>
                        </span>
                      );
                    }

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border bg-card"
                      >
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
                                <span>End: {new Date(task.endDate).toLocaleDateString()}</span>
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
                              onClick={() => onEditTask(task)}
                              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeletingTask(task)}
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
                                    onClick={() => handleDelete(task)}
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
                  })}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default TaskList;
