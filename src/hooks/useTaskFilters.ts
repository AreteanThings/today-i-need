
import { Task } from "@/types/task";
import { isTaskDueOnDate } from './useTasks.utils';

export const useTaskFilters = (tasks: Task[]) => {
  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const active: any[] = [];
    const done: any[] = [];
    const overdue: any[] = [];
    
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
      
      const startDate = new Date(task.startDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (startDate < today) {
        let checkDate = new Date(Math.max(startDate.getTime(), startDate.getTime()));
        
        while (checkDate <= yesterday) {
          if (isTaskDueOnDate(task, checkDate)) {
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const completion = task.completedDates.find(cd => cd.date === checkDateStr);
            
            if (completion) {
              // Overdue task that was completed - add to done section
              done.push({
                ...task,
                completedAt: completion.completedAt,
                completedBy: completion.completedBy,
                dueDate: checkDate.toISOString(),
                id: `${task.id}-${checkDateStr}`,
                wasOverdue: true
              });
            } else {
              // Overdue task that's still incomplete
              overdue.push({
                ...task,
                dueDate: checkDate.toISOString(),
                id: `${task.id}-${checkDateStr}`
              });
            }
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    });
    
    return { active, done, overdue };
  };

  return {
    getTodayTasks,
  };
};
