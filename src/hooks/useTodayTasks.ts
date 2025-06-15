
import { useMemo } from 'react';
import { Task } from "@/types/task";
import { isTaskDueOnDate } from './useTasks.utils';
import { TodayTask } from '@/components/TodayList/TodayTaskItem';

export interface TodayTasksData {
  active: TodayTask[];
  done: TodayTask[];
  overdue: TodayTask[];
}

export const useTodayTasks = (tasks: Task[], hiddenOverdueTasks: Set<string>): TodayTasksData => {
  return useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const active: TodayTask[] = [];
    const done: TodayTask[] = [];
    const overdue: TodayTask[] = [];
    
    tasks.forEach(task => {
      if (!task.isActive) return;
      
      const isDueToday = isTaskDueOnDate(task, today);
      
      if (isDueToday) {
        const todayCompletion = task.completedDates.find(cd => cd.date === todayStr);
        
        if (todayCompletion) {
          done.push({
            ...task,
            completedAt: todayCompletion.completedAt,
            completedBy: todayCompletion.completedBy
          });
        } else {
          active.push(task);
        }
      }
      
      // Check for overdue tasks
      const startDate = new Date(task.startDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (startDate < today) {
        let checkDate = new Date(Math.max(startDate.getTime(), startDate.getTime()));
        
        while (checkDate <= yesterday) {
          if (isTaskDueOnDate(task, checkDate)) {
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const completion = task.completedDates.find(cd => cd.date === checkDateStr);
            const taskWithDateId = `${task.id}-${checkDateStr}`;
            
            if (completion) {
              // Overdue task that was completed - add to done section
              done.push({
                ...task,
                completedAt: completion.completedAt,
                completedBy: completion.completedBy,
                dueDate: checkDate.toISOString(),
                id: taskWithDateId,
                wasOverdue: true
              });
            } else if (!hiddenOverdueTasks.has(taskWithDateId)) {
              // Overdue task that's still incomplete and not hidden
              overdue.push({
                ...task,
                dueDate: checkDate.toISOString(),
                id: taskWithDateId
              });
            }
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    });
    
    return { active, done, overdue };
  }, [tasks, hiddenOverdueTasks]);
};
