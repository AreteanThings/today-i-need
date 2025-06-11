
import { useState, useEffect } from "react";

export interface Task {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  startDate: string;
  endDate?: string;
  repeatValue: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  isShared: boolean;
  isActive: boolean;
  createdAt: string;
  completedDates: { date: string; completedAt: string; completedBy: string }[];
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("todayINeedTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("todayINeedTasks", JSON.stringify(tasks));
  }, [tasks]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addTask = (taskData: Omit<Task, "id" | "isActive" | "createdAt" | "completedDates">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const markTaskDone = (taskId: string, isOverdue = false) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedDate = isOverdue ? task.completedDates[task.completedDates.length - 1]?.date || today : today;
        const newCompletedDates = task.completedDates.filter(cd => cd.date !== completedDate);
        newCompletedDates.push({
          date: completedDate,
          completedAt: now,
          completedBy: "You" // In future, this would be the actual user name
        });
        
        return {
          ...task,
          completedDates: newCompletedDates
        };
      }
      return task;
    }));
  };

  const undoTaskDone = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completedDates: task.completedDates.filter(cd => cd.date !== today)
        };
      }
      return task;
    }));
  };

  const isTaskDueOnDate = (task: Task, date: Date): boolean => {
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
        // TODO: Implement custom repeat logic
        return daysDiff % 1 === 0; // Default to daily for now
      default:
        return false;
    }
  };

  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const active: any[] = [];
    const done: any[] = [];
    const overdue: any[] = [];
    
    tasks.forEach(task => {
      if (!task.isActive) return;
      
      // Check if task is due today
      if (isTaskDueOnDate(task, today)) {
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
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let checkDate = new Date(task.startDate);
      while (checkDate < today) {
        if (isTaskDueOnDate(task, checkDate)) {
          const checkDateStr = checkDate.toISOString().split('T')[0];
          const completion = task.completedDates.find(cd => cd.date === checkDateStr);
          
          if (!completion) {
            overdue.push({
              ...task,
              dueDate: checkDate.toISOString(),
              id: `${task.id}-${checkDateStr}` // Unique ID for overdue instances
            });
          }
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    });
    
    return { active, done, overdue };
  };

  const categories = [...new Set(tasks.map(task => task.category))].filter(Boolean);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    markTaskDone,
    undoTaskDone,
    getTodayTasks,
    categories,
  };
};
