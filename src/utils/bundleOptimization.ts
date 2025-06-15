
// Bundle optimization utilities
// These help reduce bundle size by providing tree-shakable exports

// Lazy load heavy dependencies
export const lazyLoadRRule = async () => {
  const { RRule, rrulestr } = await import('rrule');
  return { RRule, rrulestr };
};

// Optimized date-fns imports (tree-shakable)
export {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  isPast,
  isFuture,
  parseISO,
  isValid
} from 'date-fns';

// Optimized lucide-react imports
export {
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';

// Helper to dynamically import heavy components
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Remove unused imports helper
export const removeUnusedImports = (code: string): string => {
  // This would be used in a build script to remove unused imports
  // For now, it's a placeholder for future implementation
  return code;
};
