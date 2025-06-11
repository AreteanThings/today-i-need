import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Undo2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

interface TodayListProps {
  onEditTask: (task: any) => void;
}

const TodayList = ({ onEditTask }: TodayListProps) => {
  const { getTodayTasks, markTaskDone, undoTaskDone } = useTasks();
  const { toast } = useToast();
  const [hiddenOverdueTasks, setHiddenOverdueTasks] = useState<Set<string>>(new Set());

  const { active, done, overdue } = getTodayTasks();

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

  const TaskSection = ({ 
    title, 
    tasks, 
    type 
  }: { 
    title: string; 
    tasks: any[]; 
    type: 'active' | 'done' | 'overdue' 
  }) => {
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
    }, {} as Record<string, any[]>);

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-foreground">{title}</h2>
        {Object.entries(groupedTasks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryTasks]) => (
            <div key={category} className="mb-4 border border-red-500 rounded-lg p-3">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {(categoryTasks as any[])
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
                          {type === 'done' && task.completedAt && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.completedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.completedBy || 'You'}
                              </div>
                            </div>
                          )}
                          
                          {/* Due date for overdue tasks */}
                          {type === 'overdue' && task.dueDate && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-3">
                          {type === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkDone(task.id)}
                            >
                              Done
                            </Button>
                          )}
                          {type === 'done' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUndo(task.id)}
                            >
                              <Undo2 className="h-3 w-3 mr-1" />
                              Undo
                            </Button>
                          )}
                          {type === 'overdue' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkDone(task.id, true)}
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

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground font-poppins">
          Today - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h1>
      </div>

      <TaskSection title="Active" tasks={active} type="active" />
      <TaskSection title="Done" tasks={done} type="done" />
      <TaskSection title="Overdue" tasks={overdue} type="overdue" />
      
      {active.length === 0 && done.length === 0 && overdue.filter(task => !hiddenOverdueTasks.has(task.id)).length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks for today!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a task to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayList;
