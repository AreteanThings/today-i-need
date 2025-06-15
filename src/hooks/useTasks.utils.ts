
import { Task } from "@/types/task";
import { rrulestr } from "rrule";

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

  // If before start or after end, not due
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
      // Use rrule to properly evaluate custom repeat logic
      if (task.customRrule) {
        // Normalize: make sure RRULE: prefix exists if not already present
        let ruleString = task.customRrule.startsWith("RRULE:") ? task.customRrule : "RRULE:" + task.customRrule;
        try {
          const rule = rrulestr(ruleString, { dtstart: new Date(task.startDate) });
          // rrule occurs() is used to check if a given date is an occurrence
          // rrule requires time to be included, so compare using date-only for both
          // Set input date time to start of day
          const candidateDate = new Date(date);
          candidateDate.setHours(0, 0, 0, 0);
          const after = new Date(candidateDate);
          after.setHours(0, 0, 0, 0);
          after.setDate(candidateDate.getDate() + 1);

          // Check if there is an occurrence on this date
          // rrule.between will return all occurrences for that day, if any
          const occurrences = rule.between(candidateDate, after, true);
          return occurrences.length > 0;
        } catch {
          // fallback: original (broken) logic
          return daysDiff % 1 === 0;
        }
      }
      // fallback in case no custom rule set: treat as daily (current behavior)
      return daysDiff % 1 === 0;
    default:
      return false;
  }
};

// Helper: Get the next due date (after today) for a given task
export const getNextDueDate = (task: Task): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Special logic for "custom" (i.e. RRULE-based) tasks
  if (task.repeatValue === "custom" && task.customRrule) {
    try {
      let ruleString = task.customRrule.startsWith("RRULE:") ? task.customRrule : "RRULE:" + task.customRrule;
      const rule = rrulestr(ruleString, { dtstart: new Date(task.startDate) });
      // Get the next valid occurrence after today
      const afterDate = new Date(today);
      afterDate.setDate(afterDate.getDate() + 1);
      // Return the next date after today that has not been completed
      let candidate = rule.after(today, true);
      while (candidate && candidate <= (task.endDate ? new Date(task.endDate) : candidate)) {
        const candidateStr = candidate.toISOString().split('T')[0];
        if (!task.completedDates.some(cd => cd.date === candidateStr)) {
          return candidateStr;
        }
        candidate = rule.after(candidate, false); // Go to next occurrence if this one is already completed
      }
      return null;
    } catch {
      // fallback to old loop-based if RRULE errors
      // continue to generic code below
    }
  }

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

