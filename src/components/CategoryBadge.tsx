
import { getCategoryColor, getCategoryColorDark } from '@/utils/categoryColors';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge = ({ category, className = '' }: CategoryBadgeProps) => {
  const lightColors = getCategoryColor(category);
  const darkColors = getCategoryColorDark(category);
  
  return (
    <span 
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
        ${lightColors} dark:${darkColors}
        ${className}
      `}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
