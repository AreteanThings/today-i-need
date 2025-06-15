import { useMemo } from "react";
import { Task } from "@/types/task";
import { isTaskDueOnDate } from "@/hooks/useTasks.utils";

interface TaskHistoryCalendarProps {
  task: Task;
  currentDate: Date;
}

const TaskHistoryCalendar = ({ task, currentDate }: TaskHistoryCalendarProps) => {
  const { calendarDays, monthStart } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const days = [];
    const loopDate = new Date(startDate);
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);
    }
    
    return { calendarDays: days, monthStart };
  }, [currentDate]);

  const getDateStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    
    // Check if task is due on this date
    const isDue = isTaskDueOnDate(task, date);
    
    if (!isDue) {
      return { 
        status: 'none', 
        isCurrentMonth,
        className: isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'
      };
    }
    
    // Check if completed on this date
    const isCompleted = task.completedDates.some(cd => cd.date === dateStr);
    
    if (date.getTime() === today.getTime()) {
      // Today
      return {
        status: isCompleted ? 'completed' : 'due-today',
        isCurrentMonth,
        className: 'font-bold'
      };
    } else if (date < today) {
      // Past date
      return {
        status: isCompleted ? 'completed' : 'missed',
        isCurrentMonth,
        className: isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'
      };
    } else {
      // Future date
      return {
        status: 'due-future',
        isCurrentMonth,
        className: isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-2 h-2 rounded-full bg-green-500 mx-auto"></div>;
      case 'missed':
        return <div className="w-2 h-2 rounded-full bg-red-500 mx-auto"></div>;
      case 'due-future':
        return <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto"></div>;
      case 'due-today':
        return <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto"></div>;
      default:
        return null;
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const { status, isCurrentMonth, className } = getDateStatus(date);
          
          return (
            <div
              key={index}
              className={`
                relative text-center p-2 text-sm min-h-[32px] flex flex-col justify-center
                ${className}
                ${!isCurrentMonth ? 'opacity-30' : ''}
              `}
            >
              <div>{date.getDate()}</div>
              {getStatusIcon(status)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskHistoryCalendar;
