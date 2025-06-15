
import React, { createContext, useContext, ReactNode } from 'react';

interface TaskActionsContextType {
  onMarkDone: (taskId: string, isOverdue?: boolean) => void;
  onUndo: (taskId: string) => void;
}

const TaskActionsContext = createContext<TaskActionsContextType | undefined>(undefined);

interface TaskActionsProviderProps {
  children: ReactNode;
  onMarkDone: (taskId: string, isOverdue?: boolean) => void;
  onUndo: (taskId: string) => void;
}

export const TaskActionsProvider = ({ 
  children, 
  onMarkDone, 
  onUndo 
}: TaskActionsProviderProps) => {
  return (
    <TaskActionsContext.Provider value={{ onMarkDone, onUndo }}>
      {children}
    </TaskActionsContext.Provider>
  );
};

export const useTaskActions = () => {
  const context = useContext(TaskActionsContext);
  if (context === undefined) {
    throw new Error('useTaskActions must be used within a TaskActionsProvider');
  }
  return context;
};
