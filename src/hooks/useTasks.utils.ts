import { Task } from "@/types/task";

// Utility function to make sure repeatValue is valid
export const asRepeatValue = (val: any): Task["repeatValue"] => {
  if (["daily", "weekly", "monthly", "yearly", "custom"].includes(val)) {
    return val as Task["repeatValue"];
  }
  return "daily"; // fallback value
};

export const isTaskDueOnDate = (task: Task, date: Date): boolean => {
  const startDate = new Date(task.startDate);
  const endDate = task.endDate ? new Date(task.endDate) : null;

  if (date < startDate) return false;
  if (endDate && date > endDate) return false;

  const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (task.repeatValue) {
    case "daily":
      return true;
    case "weekly":
      return daysDiff % 7 === 0;
    case "monthly":
      return date.getDate() === startDate.getDate();
    case "yearly":
      return date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate();
    case "custom":
      return daysDiff % 1 === 0;
    default:
      return false;
  }
};

// Helper: Get the next due date (after today) for a given task
export const getNextDueDate = (task: Task): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = new Date(today);
  let cycles = 0;

  // Find the next due date that's not completed yet, not in the past, and not today
  while (cycles < 365) { // Limit lookahead for performance/safety
    checkDate.setDate(checkDate.getDate() + 1);
    if (task.endDate && checkDate > new Date(task.endDate)) break;
    if (isTaskDueOnDate(task, checkDate)) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (!task.completedDates.some(cd => cd.date === checkDateStr)) {
        return checkDateStr;
      }
    }
    cycles++;
  }
  return null; // No next due date found
};

// Helper: Get the most recent overdue date for uncompleted occurrences
export const getMostRecentOverdueDate = (task: Task): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let mostRecent: Date | null = null;
  let checkDate = new Date(task.startDate);
  checkDate.setHours(0, 0, 0, 0);

  const endLimit = new Date(today);
  endLimit.setDate(endLimit.getDate() - 1); // Only consider before today

  while (checkDate <= endLimit) {
    if (task.endDate && checkDate > new Date(task.endDate)) break;
    if (isTaskDueOnDate(task, checkDate)) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (!task.completedDates.some(cd => cd.date === checkDateStr)) {
        if (!mostRecent || checkDate > mostRecent) {
          mostRecent = new Date(checkDate);
        }
      }
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return mostRecent ? mostRecent.toISOString().split('T')[0] : null;
};
