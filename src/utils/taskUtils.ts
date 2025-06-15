
import { Task } from "@/types/task";
import { isTaskDueOnDate, getNextDueDate, getMostRecentOverdueDate } from "@/hooks/useTasks.utils";

export interface TaskStatus {
  isOverdue: boolean;
  isDueToday: boolean;
  isCompleted: boolean;
  nextDueDate: string | null;
  overdueDateStr: string | null;
}

export const getTaskStatus = (task: Task, date: Date = new Date()): TaskStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayStr = today.toISOString().split('T')[0];
  const overdueDateStr = getMostRecentOverdueDate(task);
  const nextDueDateStr = getNextDueDate(task);
  const isDueToday = isTaskDueOnDate(task, today);
  const isCompletedToday = task.completedDates.some(cd => cd.date === todayStr);

  return {
    isOverdue: !!overdueDateStr,
    isDueToday,
    isCompleted: isCompletedToday,
    nextDueDate: nextDueDateStr,
    overdueDateStr,
  };
};

export const getTaskDisplayInfo = (task: Task) => {
  const status = getTaskStatus(task);
  
  let statusText = '';
  let statusClass = '';
  
  if (status.isOverdue) {
    statusText = `Overdue`;
    statusClass = 'text-destructive font-medium';
  } else if (status.nextDueDate) {
    statusText = `Next Due`;
    statusClass = 'text-foreground';
  } else {
    statusText = 'No upcoming due dates';
    statusClass = 'text-muted-foreground';
  }

  return {
    ...status,
    statusText,
    statusClass,
  };
};

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    const statusA = getTaskStatus(a);
    const statusB = getTaskStatus(b);
    
    // Overdue tasks first
    if (statusA.isOverdue && !statusB.isOverdue) return -1;
    if (!statusA.isOverdue && statusB.isOverdue) return 1;
    
    // Then tasks due today
    if (statusA.isDueToday && !statusB.isDueToday) return -1;
    if (!statusA.isDueToday && statusB.isDueToday) return 1;
    
    // Finally alphabetical
    return a.title.localeCompare(b.title);
  });
};
