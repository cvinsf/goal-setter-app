import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoalType, Goal, DifficultyLevel } from '../types';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date to ISO string for input fields
 */
export function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calculate percentage with optional decimal places
 */
export function calculatePercentage(current: number, target: number, decimals = 0): number {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Number(percentage.toFixed(decimals)));
}

/**
 * Get the progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-success';
  if (percentage >= 75) return 'bg-success/80';
  if (percentage >= 50) return 'bg-warning';
  if (percentage >= 25) return 'bg-warning/80';
  return 'bg-primary-400';
}

/**
 * Get the text color for progress display
 */
export function getProgressTextColor(percentage: number): string {
  if (percentage >= 100) return 'text-success-dark';
  if (percentage >= 75) return 'text-success';
  if (percentage >= 50) return 'text-warning-dark';
  if (percentage >= 25) return 'text-warning';
  return 'text-primary-600';
}

/**
 * Generate a unique ID (simple implementation)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get date range for a goal type
 */
export function getDateRangeForGoalType(type: GoalType, referenceDate: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  switch (type) {
    case GoalType.YEARLY:
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    case GoalType.MONTHLY:
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      break;
    case GoalType.WEEKLY:
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
      break;
    case GoalType.DAILY:
      // Start and end are the same day
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Check if a goal is overdue
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.endDate || goal.isCompleted) return false;
  return new Date(goal.endDate) < new Date();
}

/**
 * Get days remaining for a goal
 */
export function getDaysRemaining(endDate: Date | string | undefined): number {
  if (!endDate) return 0;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format time duration in hours to human readable
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours === 1) return '1 hour';
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  switch (level) {
    case DifficultyLevel.VERY_EASY:
      return 'text-success bg-success/10';
    case DifficultyLevel.EASY:
      return 'text-success/80 bg-success/10';
    case DifficultyLevel.MODERATE:
      return 'text-warning bg-warning/10';
    case DifficultyLevel.HARD:
      return 'text-danger/80 bg-danger/10';
    case DifficultyLevel.VERY_HARD:
      return 'text-danger bg-danger/10';
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Parse comma-separated string to array
 */
export function parseCSV(input: string): string[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Calculate weekly progress contribution to parent goals
 */
export function calculateWeeklyContribution(
  completedDaily: number,
  totalDaily: number,
  weeksInMonth = 4
): number {
  const weeklyCompletion = totalDaily > 0 ? completedDaily / totalDaily : 0;
  return (weeklyCompletion / weeksInMonth) * 100;
}

/**
 * Group goals by type
 */
export function groupGoalsByType(goals: Goal[]): Record<GoalType, Goal[]> {
  return {
    [GoalType.YEARLY]: goals.filter((g) => g.goalType === GoalType.YEARLY),
    [GoalType.MONTHLY]: goals.filter((g) => g.goalType === GoalType.MONTHLY),
    [GoalType.WEEKLY]: goals.filter((g) => g.goalType === GoalType.WEEKLY),
    [GoalType.DAILY]: goals.filter((g) => g.goalType === GoalType.DAILY),
  };
}

/**
 * Build goal hierarchy tree
 */
export function buildGoalTree(goals: Goal[]): Goal[] {
  const goalsMap = new Map<string, Goal & { children?: Goal[] }>();
  const rootGoals: Goal[] = [];

  // Create a map of all goals
  goals.forEach((goal) => {
    goalsMap.set(goal.id, { ...goal, children: [] });
  });

  // Build the tree
  goals.forEach((goal) => {
    const node = goalsMap.get(goal.id)!;
    if (goal.parentGoalId && goalsMap.has(goal.parentGoalId)) {
      const parent = goalsMap.get(goal.parentGoalId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      rootGoals.push(node);
    }
  });

  return rootGoals;
}

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
