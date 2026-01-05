import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Goal,
  GoalType,
  CreateGoalInput,
  UpdateGoalInput,
  GoalHierarchy,
} from '../types';
import { groupGoalsByType, storage } from '../utils';

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

            const goals: Goal[] = (data || []).map((row) => ({
              id: row.id,
              userId: row.user_id,
              parentGoalId: row.parent_goal_id,
              title: row.title,
              description: row.description || undefined,
              goalType: row.goal_type as GoalType,
              trackingType: row.tracking_type,
              isCompleted: row.is_completed,
              currentValue: row.current_value || undefined,
              targetValue: row.target_value || undefined,
              unit: row.unit || undefined,
              startDate: row.start_date ? new Date(row.start_date) : undefined,
              endDate: row.end_date ? new Date(row.end_date) : undefined,
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
              difficultyLevel: row.difficulty_level || undefined,
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

            const { data, error } = await supabase
              .from('goals')
              .insert({
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
              })
              .select()
              .single();

            if (error) throw error;

            const newGoal: Goal = {
              id: data.id,
              userId: data.user_id,
              parentGoalId: data.parent_goal_id,
              title: data.title,
              description: data.description || undefined,
              goalType: data.goal_type as GoalType,
              trackingType: data.tracking_type,
              isCompleted: data.is_completed,
              currentValue: data.current_value || undefined,
              targetValue: data.target_value || undefined,
              unit: data.unit || undefined,
              startDate: data.start_date ? new Date(data.start_date) : undefined,
              endDate: data.end_date ? new Date(data.end_date) : undefined,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at),
              difficultyLevel: data.difficulty_level || undefined,
              estimatedTimeHours: data.estimated_time_hours || undefined,
              resourcesNeeded: data.resources_needed || undefined,
              feasibilityNotes: data.feasibility_notes || undefined,
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
            const { data, error } = await supabase
              .from('goals')
              .update({
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
              })
              .eq('id', input.id)
              .select()
              .single();

            if (error) throw error;

            const updatedGoal: Goal = {
              id: data.id,
              userId: data.user_id,
              parentGoalId: data.parent_goal_id,
              title: data.title,
              description: data.description || undefined,
              goalType: data.goal_type as GoalType,
              trackingType: data.tracking_type,
              isCompleted: data.is_completed,
              currentValue: data.current_value || undefined,
              targetValue: data.target_value || undefined,
              unit: data.unit || undefined,
              startDate: data.start_date ? new Date(data.start_date) : undefined,
              endDate: data.end_date ? new Date(data.end_date) : undefined,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at),
              difficultyLevel: data.difficulty_level || undefined,
              estimatedTimeHours: data.estimated_time_hours || undefined,
              resourcesNeeded: data.resources_needed || undefined,
              feasibilityNotes: data.feasibility_notes || undefined,
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
