
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
  customRrule?: string;
  customRruleText?: string; // Human-readable text for custom rules
}
