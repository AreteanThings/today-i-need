
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
