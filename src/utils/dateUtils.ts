
import { format, isToday, isTomorrow, isYesterday, differenceInDays, isPast, isFuture } from 'date-fns';

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  const daysDiff = differenceInDays(date, now);
  
  if (isPast(date) && Math.abs(daysDiff) <= 7) {
    return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`;
  }
  
  if (isFuture(date) && daysDiff <= 7) {
    return `In ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
  }
  
  // For dates further than a week, show the actual date
  return format(date, 'MMM d, yyyy');
};

export const formatRelativeDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  const daysDiff = Math.abs(differenceInDays(date, new Date()));
  
  if (daysDiff <= 7) {
    return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago at ${format(date, 'h:mm a')}`;
  }
  
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
};
