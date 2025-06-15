
import { format, isToday, isTomorrow, isYesterday, differenceInDays, isPast, isFuture, parseISO, isValid } from 'date-fns';

export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatDateString = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentDateTimeString = (): string => {
  return new Date().toISOString();
};

export const parseDate = (dateString: string): Date => {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
};

export const formatDisplayDate = (dateString: string): string => {
  try {
    const date = parseDate(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    
    const daysDiff = differenceInDays(date, new Date());
    
    if (isPast(date) && Math.abs(daysDiff) <= 7) {
      return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`;
    }
    
    if (isFuture(date) && daysDiff <= 7) {
      return `In ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
    }
    
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDisplayDateTime = (dateTimeString: string): string => {
  try {
    const date = parseDate(dateTimeString);
    
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
  } catch {
    return dateTimeString;
  }
};

export const isValidDateRange = (startDate: string, endDate?: string): boolean => {
  try {
    const start = parseDate(startDate);
    if (endDate) {
      const end = parseDate(endDate);
      return start <= end;
    }
    return true;
  } catch {
    return false;
  }
};
