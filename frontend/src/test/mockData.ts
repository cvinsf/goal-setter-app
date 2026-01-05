import {
  Goal,
  GoalType,
  TrackingType,
  DifficultyLevel,
  Notification,
  NotificationType,
  SubscriptionTier,
} from '../types';

export const mockYearlyGoal: Goal = {
  id: 'yearly-1',
  userId: 'user-1',
  parentGoalId: null,
  title: 'Run a Marathon',
  description: 'Complete a full marathon by end of year',
  goalType: GoalType.YEARLY,
  trackingType: TrackingType.CHECKBOX,
  isCompleted: false,
  currentValue: 0,
  targetValue: 1,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  difficultyLevel: DifficultyLevel.HARD,
  estimatedTimeHours: 500,
};

export const mockMonthlyGoal: Goal = {
  id: 'monthly-1',
  userId: 'user-1',
  parentGoalId: 'yearly-1',
  title: 'Run 100 miles',
  description: 'Build endurance this month',
  goalType: GoalType.MONTHLY,
  trackingType: TrackingType.NUMERIC,
  isCompleted: false,
  currentValue: 45,
  targetValue: 100,
  unit: 'miles',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-31'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-15'),
  difficultyLevel: DifficultyLevel.MODERATE,
  estimatedTimeHours: 40,
};

export const mockWeeklyGoal: Goal = {
  id: 'weekly-1',
  userId: 'user-1',
  parentGoalId: 'monthly-1',
  title: 'Run 25 miles',
  description: 'Weekly mileage target',
  goalType: GoalType.WEEKLY,
  trackingType: TrackingType.HYBRID,
  isCompleted: false,
  currentValue: 15,
  targetValue: 25,
  unit: 'miles',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-07'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-05'),
  difficultyLevel: DifficultyLevel.MODERATE,
  estimatedTimeHours: 10,
};

export const mockDailyGoal: Goal = {
  id: 'daily-1',
  userId: 'user-1',
  parentGoalId: 'weekly-1',
  title: 'Run 3 miles',
  description: 'Morning run',
  goalType: GoalType.DAILY,
  trackingType: TrackingType.HYBRID,
  isCompleted: false,
  currentValue: 2,
  targetValue: 3,
  unit: 'miles',
  startDate: new Date('2026-01-05'),
  endDate: new Date('2026-01-05'),
  createdAt: new Date('2026-01-05'),
  updatedAt: new Date('2026-01-05'),
  difficultyLevel: DifficultyLevel.EASY,
  estimatedTimeHours: 0.5,
};

export const mockCompletedGoal: Goal = {
  ...mockDailyGoal,
  id: 'daily-2',
  title: 'Stretch for 10 minutes',
  isCompleted: true,
  currentValue: 1,
  targetValue: 1,
  trackingType: TrackingType.CHECKBOX,
};

export const mockGoals: Goal[] = [
  mockYearlyGoal,
  mockMonthlyGoal,
  mockWeeklyGoal,
  mockDailyGoal,
  mockCompletedGoal,
];

export const mockNotification: Notification = {
  id: 'notif-1',
  userId: 'user-1',
  title: 'Weekly Progress Summary',
  message: 'You completed 5 out of 7 daily goals this week!',
  type: NotificationType.WEEKLY_SUMMARY,
  isRead: false,
  createdAt: new Date('2026-01-05'),
};

export const mockNotifications: Notification[] = [
  mockNotification,
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Great Progress!',
    message: 'You are 45% done with your monthly goal',
    type: NotificationType.ACHIEVEMENT,
    isRead: true,
    createdAt: new Date('2026-01-03'),
  },
];

export const mockWeeklySummary = {
  weekStartDate: new Date('2026-01-01'),
  weekEndDate: new Date('2026-01-07'),
  totalDailyGoals: 7,
  completedDailyGoals: 5,
  completionPercentage: 71,
  contributionToMonthly: 17.75,
  contributionToYearly: 1.48,
};
