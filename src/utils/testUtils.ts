
import { Task } from "@/types/task";

export const createMockTask = (overrides: Partial<Task> = {}): Task => {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  
  return {
    id: `mock-task-${Math.random().toString(36).substr(2, 9)}`,
    title: "Mock Task",
    subtitle: "",
    category: "General",
    startDate: today,
    endDate: null,
    repeatValue: "daily",
    customRrule: null,
    isShared: false,
    isActive: true,
    createdAt: now,
    completedDates: [],
    ...overrides,
  };
};

export const createMockTasks = (count: number, baseOverrides: Partial<Task> = {}): Task[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      ...baseOverrides,
      title: `Mock Task ${index + 1}`,
      id: `mock-task-${index + 1}`,
    })
  );
};

export const createOverdueTask = (daysAgo: number = 1): Task => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo);
  const pastDateStr = pastDate.toISOString().split('T')[0];
  
  return createMockTask({
    title: `Overdue Task (${daysAgo} days ago)`,
    startDate: pastDateStr,
    repeatValue: "daily",
  });
};

export const createCompletedTask = (completedDate?: string): Task => {
  const dateStr = completedDate || new Date().toISOString().split('T')[0];
  
  return createMockTask({
    title: "Completed Task",
    completedDates: [{
      date: dateStr,
      completedAt: new Date().toISOString(),
      completedBy: "Test User",
    }],
  });
};

export const createFutureTask = (daysFromNow: number = 1): Task => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysFromNow);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  return createMockTask({
    title: `Future Task (in ${daysFromNow} days)`,
    startDate: futureDateStr,
  });
};

// Mock user object for testing
export const createMockUser = () => ({
  id: "mock-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
  },
});

// Mock toast for testing
export const createMockToast = () => ({
  title: "",
  description: "",
  variant: "default" as const,
});

export const mockSetGlobalLoading = jest.fn();
export const mockSetLoading = jest.fn();
export const mockSetTasks = jest.fn();

// Helper to wait for async operations in tests
export const waitFor = (ms: number = 0): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate user interactions
export const simulateDelay = (ms: number = 100): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
