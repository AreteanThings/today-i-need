
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateTaskTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Title is required');
  }
  
  if (title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (title.trim().length < 2) {
    errors.push('Title must be at least 2 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTaskCategory = (category: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!category.trim()) {
    errors.push('Category is required');
  }
  
  if (category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDateRange = (startDate: string, endDate?: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!startDate) {
    errors.push('Start date is required');
  }
  
  if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
    errors.push('End date must be after start date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
