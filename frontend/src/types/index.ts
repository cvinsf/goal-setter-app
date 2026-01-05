// ==================== Core Types ====================

export type GoalType = 'yearly' | 'monthly' | 'weekly' | 'daily';
export const GoalType = {
  YEARLY: 'yearly' as const,
  MONTHLY: 'monthly' as const,
  WEEKLY: 'weekly' as const,
  DAILY: 'daily' as const,
};

export type TrackingType = 'checkbox' | 'numeric' | 'hybrid';
export const TrackingType = {
  CHECKBOX: 'checkbox' as const,
  NUMERIC: 'numeric' as const,
  HYBRID: 'hybrid' as const,
};

export type SubscriptionTier = 'free' | 'paid';
export const SubscriptionTier = {
  FREE: 'free' as const,
  PAID: 'paid' as const,
};

export type NotificationType = 'weekly_summary' | 'reminder' | 'achievement';
export const NotificationType = {
  WEEKLY_SUMMARY: 'weekly_summary' as const,
  REMINDER: 'reminder' as const,
  ACHIEVEMENT: 'achievement' as const,
};

export type LLMProvider = 'openai' | 'anthropic' | 'google';
export const LLMProvider = {
  OPENAI: 'openai' as const,
  ANTHROPIC: 'anthropic' as const,
  GOOGLE: 'google' as const,
};

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export const DifficultyLevel = {
  VERY_EASY: 1 as const,
  EASY: 2 as const,
  MODERATE: 3 as const,
  HARD: 4 as const,
  VERY_HARD: 5 as const,
};

// ==================== Database Models ====================

export interface User {
  id: string;
  email?: string;
  createdAt: Date;
  subscriptionTier: SubscriptionTier;
}

export interface Goal {
  id: string;
  userId: string;
  parentGoalId: string | null;
  title: string;
  description?: string;
  goalType: GoalType;

  // Progress tracking
  trackingType: TrackingType;
  isCompleted: boolean;
  currentValue?: number;
  targetValue?: number;
  unit?: string; // e.g., 'miles', 'dollars', 'hours', 'pages'

  // Metadata
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Consultation/planning data
  difficultyLevel?: DifficultyLevel;
  estimatedTimeHours?: number;
  resourcesNeeded?: string[];
  feasibilityNotes?: string;
}

export interface ProgressLog {
  id: string;
  goalId: string;
  loggedAt: Date;
  value: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface UserAPIKey {
  id: string;
  userId: string;
  provider: LLMProvider;
  encryptedKey: string;
  createdAt: Date;
}

// ==================== Extended Types with Relations ====================

export interface GoalWithChildren extends Goal {
  children: Goal[];
  progressPercentage: number;
}

export interface GoalHierarchy {
  yearly: GoalWithChildren[];
  monthly: GoalWithChildren[];
  weekly: GoalWithChildren[];
  daily: GoalWithChildren[];
}

export interface WeeklySummary {
  weekStartDate: Date;
  weekEndDate: Date;
  totalDailyGoals: number;
  completedDailyGoals: number;
  completionPercentage: number;
  contributionToMonthly: number;
  contributionToYearly: number;
}

// ==================== Form Types ====================

export interface CreateGoalInput {
  title: string;
  description?: string;
  goalType: GoalType;
  parentGoalId?: string | null;
  trackingType: TrackingType;
  targetValue?: number;
  unit?: string;
  startDate?: Date;
  endDate?: Date;
  difficultyLevel?: DifficultyLevel;
  estimatedTimeHours?: number;
  resourcesNeeded?: string[];
  feasibilityNotes?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  id: string;
  isCompleted?: boolean;
  currentValue?: number;
}

export interface GoalFormData {
  title: string;
  description: string;
  trackingType: TrackingType;
  targetValue: string;
  unit: string;
  startDate: string;
  endDate: string;
  difficultyLevel: DifficultyLevel;
  estimatedTimeHours: string;
  resourcesNeeded: string;
  feasibilityNotes: string;
}

// ==================== LLM Integration Types ====================

export interface LLMSuggestion {
  breakdown: string[];
  examples: string[];
  tips: string[];
  estimatedTimeline?: string;
  feasibilityScore?: number; // 0-100
  potentialChallenges?: string[];
}

export interface LLMRequest {
  prompt: string;
  context?: {
    goalTitle: string;
    goalType: GoalType;
    parentGoal?: Goal;
    timeline?: {
      startDate: Date;
      endDate: Date;
    };
  };
}

export interface LLMResponse {
  suggestions: LLMSuggestion;
  model: string;
  timestamp: Date;
}

// ==================== UI State Types ====================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'create-goal' | 'edit-goal' | 'delete-confirm' | 'weekly-summary' | null;
  data?: any;
}

export interface SidePanelState {
  isOpen: boolean;
  selectedGoalType: GoalType | null;
  expandedGoalIds: string[];
}

// ==================== Store State Types ====================

export interface GoalStore {
  goals: Goal[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (input: UpdateGoalInput) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  updateProgress: (id: string, currentValue: number) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;

  // Selectors
  getGoalsByType: (type: GoalType) => Goal[];
  getGoalsByParent: (parentId: string | null) => Goal[];
  getGoalHierarchy: () => GoalHierarchy;
  calculateProgress: (goalId: string) => number;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createWeeklySummary: (summary: WeeklySummary) => Promise<void>;
}

export interface SettingsStore {
  subscriptionTier: SubscriptionTier;
  apiKeys: Record<LLMProvider, string | null>;

  // Actions
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setAPIKey: (provider: LLMProvider, key: string) => Promise<void>;
  removeAPIKey: (provider: LLMProvider) => Promise<void>;
}

// ==================== Utility Types ====================

export interface DateRange {
  start: Date;
  end: Date;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== Constants ====================

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.YEARLY]: 'Yearly',
  [GoalType.MONTHLY]: 'Monthly',
  [GoalType.WEEKLY]: 'Weekly',
  [GoalType.DAILY]: 'Daily',
};

export const TRACKING_TYPE_LABELS: Record<TrackingType, string> = {
  [TrackingType.CHECKBOX]: 'Checkbox',
  [TrackingType.NUMERIC]: 'Numeric',
  [TrackingType.HYBRID]: 'Hybrid',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.VERY_EASY]: 'Very Easy',
  [DifficultyLevel.EASY]: 'Easy',
  [DifficultyLevel.MODERATE]: 'Moderate',
  [DifficultyLevel.HARD]: 'Hard',
  [DifficultyLevel.VERY_HARD]: 'Very Hard',
};

export const LLM_PROVIDER_LABELS: Record<LLMProvider, string> = {
  [LLMProvider.OPENAI]: 'OpenAI (ChatGPT)',
  [LLMProvider.ANTHROPIC]: 'Anthropic (Claude)',
  [LLMProvider.GOOGLE]: 'Google (Gemini)',
};
