
import { Task } from "@/types/task";
import { isTaskDueOnDate, getNextDueDate, getMostRecentOverdueDate } from "./useTasks.utils";

export interface TaskStatusInfo {
  isOverdue: boolean;
  isDueToday: boolean;
  isCompleted: boolean;
  nextDueDate: string | null;
  overdueDateStr: string | null;
  statusText: string;
  statusClass: string;
}

export const useTaskStatus = () => {
  const getTaskStatus = (task: Task, date: Date = new Date()): TaskStatusInfo => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    const overdueDateStr = getMostRecentOverdueDate(task);
    const nextDueDateStr = getNextDueDate(task);
    const isDueToday = isTaskDueOnDate(task, today);
    const isCompletedToday = task.completedDates.some(cd => cd.date === todayStr);

    let statusText = '';
    let statusClass = '';
    
    if (overdueDateStr) {
      statusText = 'Overdue';
      statusClass = 'text-destructive font-medium';
    } else if (isDueToday && !isCompletedToday) {
      statusText = 'Next Due';
      statusClass = 'text-foreground';
    } else if (nextDueDateStr) {
      statusText = 'Next Due';
      statusClass = 'text-foreground';
    } else {
      statusText = 'No upcoming due dates';
      statusClass = 'text-muted-foreground';
    }

    // Use today's date if the task is due today and not completed, otherwise use the next due date
    const displayDate = (isDueToday && !isCompletedToday) ? todayStr : nextDueDateStr;

    return {
      isOverdue: !!overdueDateStr,
      isDueToday,
      isCompleted: isCompletedToday,
      nextDueDate: displayDate,
      overdueDateStr,
      statusText,
      statusClass,
    };
  };

  const sortTasksByPriority = (tasks: Task[]): Task[] => {
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

  return {
    getTaskStatus,
    sortTasksByPriority,
  };
};
