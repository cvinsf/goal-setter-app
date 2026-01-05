import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type {
  Goal,
  GoalType,
  TrackingType,
  DifficultyLevel,
  CreateGoalInput,
  UpdateGoalInput,
  GoalHierarchy,
} from '../types';
import { groupGoalsByType, storage } from '../utils';

type GoalRow = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

interface GoalState {
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

const STORAGE_KEY = 'goals';

export const useGoalStore = create<GoalState>()(
  devtools(
    (set, get) => ({
      goals: [],
      loading: false,
      error: null,

      fetchGoals: async () => {
        set({ loading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) {
              // Use local storage if not authenticated
              const localGoals = storage.get<Goal[]>(STORAGE_KEY, []);
              set({ goals: localGoals, loading: false });
              return;
            }

            const { data, error } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', user.user.id)
              .order('created_at', { ascending: false });

            if (error) throw error;

            const goals: Goal[] = (data || []).map((row: GoalRow) => ({
              id: row.id,
              userId: row.user_id,
              parentGoalId: row.parent_goal_id,
              title: row.title,
              description: row.description || undefined,
              goalType: row.goal_type as GoalType,
              trackingType: row.tracking_type as TrackingType,
              isCompleted: row.is_completed,
              currentValue: row.current_value || undefined,
              targetValue: row.target_value || undefined,
              unit: row.unit || undefined,
              startDate: row.start_date ? new Date(row.start_date) : undefined,
              endDate: row.end_date ? new Date(row.end_date) : undefined,
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
              difficultyLevel: (row.difficulty_level as DifficultyLevel) || undefined,
              estimatedTimeHours: row.estimated_time_hours || undefined,
              resourcesNeeded: row.resources_needed || undefined,
              feasibilityNotes: row.feasibility_notes || undefined,
            }));

            set({ goals, loading: false });
          } else {
            // Use local storage
            const localGoals = storage.get<Goal[]>(STORAGE_KEY, []);
            set({ goals: localGoals, loading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch goals',
            loading: false,
          });
        }
      },

      createGoal: async (input) => {
        set({ loading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) throw new Error('Not authenticated');

            const insertData: GoalInsert = {
              user_id: user.user.id,
              title: input.title,
              description: input.description,
              goal_type: input.goalType,
              parent_goal_id: input.parentGoalId,
              tracking_type: input.trackingType,
              target_value: input.targetValue,
              unit: input.unit,
              start_date: input.startDate?.toISOString().split('T')[0],
              end_date: input.endDate?.toISOString().split('T')[0],
              difficulty_level: input.difficultyLevel,
              estimated_time_hours: input.estimatedTimeHours,
              resources_needed: input.resourcesNeeded,
              feasibility_notes: input.feasibilityNotes,
            };

            const { data, error } = await supabase
              .from('goals')
              .insert(insertData as any)
              .select()
              .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from insert');

            const goalData: GoalRow = data;
            const newGoal: Goal = {
              id: goalData.id,
              userId: goalData.user_id,
              parentGoalId: goalData.parent_goal_id,
              title: goalData.title,
              description: goalData.description || undefined,
              goalType: goalData.goal_type as GoalType,
              trackingType: goalData.tracking_type as TrackingType,
              isCompleted: goalData.is_completed,
              currentValue: goalData.current_value || undefined,
              targetValue: goalData.target_value || undefined,
              unit: goalData.unit || undefined,
              startDate: goalData.start_date ? new Date(goalData.start_date) : undefined,
              endDate: goalData.end_date ? new Date(goalData.end_date) : undefined,
              createdAt: new Date(goalData.created_at),
              updatedAt: new Date(goalData.updated_at),
              difficultyLevel: (goalData.difficulty_level as DifficultyLevel) || undefined,
              estimatedTimeHours: goalData.estimated_time_hours || undefined,
              resourcesNeeded: goalData.resources_needed || undefined,
              feasibilityNotes: goalData.feasibility_notes || undefined,
            };

            set((state) => ({
              goals: [newGoal, ...state.goals],
              loading: false,
            }));

            return newGoal;
          } else {
            // Local storage
            const newGoal: Goal = {
              id: `local-${Date.now()}`,
              userId: 'local-user',
              parentGoalId: input.parentGoalId || null,
              title: input.title,
              description: input.description,
              goalType: input.goalType,
              trackingType: input.trackingType,
              isCompleted: false,
              currentValue: 0,
              targetValue: input.targetValue,
              unit: input.unit,
              startDate: input.startDate,
              endDate: input.endDate,
              createdAt: new Date(),
              updatedAt: new Date(),
              difficultyLevel: input.difficultyLevel,
              estimatedTimeHours: input.estimatedTimeHours,
              resourcesNeeded: input.resourcesNeeded,
              feasibilityNotes: input.feasibilityNotes,
            };

            set((state) => {
              const newGoals = [newGoal, ...state.goals];
              storage.set(STORAGE_KEY, newGoals);
              return { goals: newGoals, loading: false };
            });

            return newGoal;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create goal',
            loading: false,
          });
          throw error;
        }
      },

      updateGoal: async (input) => {
        set({ loading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const updateData: GoalUpdate = {
              title: input.title,
              description: input.description,
              tracking_type: input.trackingType,
              is_completed: input.isCompleted,
              current_value: input.currentValue,
              target_value: input.targetValue,
              unit: input.unit,
              start_date: input.startDate?.toISOString().split('T')[0],
              end_date: input.endDate?.toISOString().split('T')[0],
              difficulty_level: input.difficultyLevel,
              estimated_time_hours: input.estimatedTimeHours,
              resources_needed: input.resourcesNeeded,
              feasibility_notes: input.feasibilityNotes,
            };

            const { data, error } = await supabase
              .from('goals')
              // @ts-expect-error - Supabase type inference issue
              .update(updateData)
              .eq('id', input.id)
              .select()
              .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from update');

            const goalData: GoalRow = data;
            const updatedGoal: Goal = {
              id: goalData.id,
              userId: goalData.user_id,
              parentGoalId: goalData.parent_goal_id,
              title: goalData.title,
              description: goalData.description || undefined,
              goalType: goalData.goal_type as GoalType,
              trackingType: goalData.tracking_type as TrackingType,
              isCompleted: goalData.is_completed,
              currentValue: goalData.current_value || undefined,
              targetValue: goalData.target_value || undefined,
              unit: goalData.unit || undefined,
              startDate: goalData.start_date ? new Date(goalData.start_date) : undefined,
              endDate: goalData.end_date ? new Date(goalData.end_date) : undefined,
              createdAt: new Date(goalData.created_at),
              updatedAt: new Date(goalData.updated_at),
              difficultyLevel: (goalData.difficulty_level as DifficultyLevel) || undefined,
              estimatedTimeHours: goalData.estimated_time_hours || undefined,
              resourcesNeeded: goalData.resources_needed || undefined,
              feasibilityNotes: goalData.feasibility_notes || undefined,
            };

            set((state) => ({
              goals: state.goals.map((g) => (g.id === input.id ? updatedGoal : g)),
              loading: false,
            }));

            return updatedGoal;
          } else {
            // Local storage
            set((state) => {
              const newGoals = state.goals.map((g) =>
                g.id === input.id ? { ...g, ...input, updatedAt: new Date() } : g
              );
              storage.set(STORAGE_KEY, newGoals);
              return { goals: newGoals, loading: false };
            });

            const updatedGoal = get().goals.find((g) => g.id === input.id);
            if (!updatedGoal) throw new Error('Goal not found');
            return updatedGoal;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update goal',
            loading: false,
          });
          throw error;
        }
      },

      deleteGoal: async (id) => {
        set({ loading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.from('goals').delete().eq('id', id);

            if (error) throw error;

            set((state) => ({
              goals: state.goals.filter((g) => g.id !== id),
              loading: false,
            }));
          } else {
            set((state) => {
              const newGoals = state.goals.filter((g) => g.id !== id);
              storage.set(STORAGE_KEY, newGoals);
              return { goals: newGoals, loading: false };
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete goal',
            loading: false,
          });
          throw error;
        }
      },

      updateProgress: async (id, currentValue) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;

        await get().updateGoal({ id, currentValue });
      },

      toggleComplete: async (id) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;

        await get().updateGoal({ id, isCompleted: !goal.isCompleted });
      },

      // Selectors
      getGoalsByType: (type) => {
        return get().goals.filter((g) => g.goalType === type);
      },

      getGoalsByParent: (parentId) => {
        return get().goals.filter((g) => g.parentGoalId === parentId);
      },

      getGoalHierarchy: () => {
        const grouped = groupGoalsByType(get().goals);
        return {
          yearly: grouped.yearly.map((g) => ({ ...g, children: [], progressPercentage: 0 })),
          monthly: grouped.monthly.map((g) => ({ ...g, children: [], progressPercentage: 0 })),
          weekly: grouped.weekly.map((g) => ({ ...g, children: [], progressPercentage: 0 })),
          daily: grouped.daily.map((g) => ({ ...g, children: [], progressPercentage: 0 })),
        };
      },

      calculateProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return 0;

        if (goal.isCompleted) return 100;

        // Numeric tracking
        if (
          (goal.trackingType === 'numeric' || goal.trackingType === 'hybrid') &&
          goal.targetValue &&
          goal.targetValue > 0
        ) {
          return Math.min(100, ((goal.currentValue || 0) / goal.targetValue) * 100);
        }

        // Calculate based on children
        const children = get().getGoalsByParent(goalId);
        if (children.length > 0) {
          const completedChildren = children.filter((c) => c.isCompleted).length;
          return (completedChildren / children.length) * 100;
        }

        return 0;
      },
    }),
    { name: 'goal-store' }
  )
);
