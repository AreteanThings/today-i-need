
// Predefined colors for categories
const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
];

// Generate a consistent color based on category name
export const getCategoryColor = (category: string): string => {
  if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  // Simple hash function to get consistent color for same category
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
};

// Dark mode variants
const DARK_CATEGORY_COLORS = [
  'bg-blue-900/30 text-blue-300 border-blue-700/50',
  'bg-green-900/30 text-green-300 border-green-700/50',
  'bg-purple-900/30 text-purple-300 border-purple-700/50',
  'bg-orange-900/30 text-orange-300 border-orange-700/50',
  'bg-pink-900/30 text-pink-300 border-pink-700/50',
  'bg-indigo-900/30 text-indigo-300 border-indigo-700/50',
  'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
  'bg-red-900/30 text-red-300 border-red-700/50',
  'bg-teal-900/30 text-teal-300 border-teal-700/50',
  'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
];

export const getCategoryColorDark = (category: string): string => {
  if (!category) return 'bg-gray-800/30 text-gray-400 border-gray-600/50';
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colorIndex = Math.abs(hash) % DARK_CATEGORY_COLORS.length;
  return DARK_CATEGORY_COLORS[colorIndex];
};
