import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGoalStore } from '../goalStore';
import { GoalType, TrackingType, type CreateGoalInput } from '../../types';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {},
  isSupabaseConfigured: () => false,
}));

describe('goalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGoalStore.setState({
      goals: [],
      loading: false,
      error: null,
    });
    localStorage.clear();
  });

  describe('createGoal', () => {
    it('creates a new goal', async () => {
      const store = useGoalStore.getState();
      const input: CreateGoalInput = {
        title: 'Test Goal',
        description: 'Test Description',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      };

      const goal = await store.createGoal(input);

      expect(goal).toMatchObject({
        title: 'Test Goal',
        description: 'Test Description',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
        isCompleted: false,
      });

      const state = useGoalStore.getState();
      expect(state.goals).toHaveLength(1);
      expect(state.goals[0]).toEqual(goal);
    });

    it('creates goal with numeric tracking', async () => {
      const store = useGoalStore.getState();
      const input: CreateGoalInput = {
        title: 'Run 5 miles',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.NUMERIC,
        targetValue: 5,
        unit: 'miles',
      };

      const goal = await store.createGoal(input);

      expect(goal.targetValue).toBe(5);
      expect(goal.unit).toBe('miles');
      expect(goal.currentValue).toBe(0);
    });

    it('creates goal with parent relationship', async () => {
      const store = useGoalStore.getState();

      // Create parent goal
      const parentGoal = await store.createGoal({
        title: 'Parent Goal',
        goalType: GoalType.YEARLY,
        trackingType: TrackingType.CHECKBOX,
      });

      // Create child goal
      const childGoal = await store.createGoal({
        title: 'Child Goal',
        goalType: GoalType.MONTHLY,
        trackingType: TrackingType.CHECKBOX,
        parentGoalId: parentGoal.id,
      });

      expect(childGoal.parentGoalId).toBe(parentGoal.id);
    });

    it('persists goals to localStorage', async () => {
      const store = useGoalStore.getState();
      await store.createGoal({
        title: 'Persistent Goal',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      const stored = JSON.parse(localStorage.getItem('goals') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Persistent Goal');
    });
  });

  describe('updateGoal', () => {
    it('updates goal title', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Original Title',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      const updated = await store.updateGoal({
        id: goal.id,
        title: 'Updated Title',
      });

      expect(updated.title).toBe('Updated Title');
    });

    it('updates goal progress', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Run 5 miles',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.NUMERIC,
        targetValue: 5,
        unit: 'miles',
      });

      const updated = await store.updateGoal({
        id: goal.id,
        currentValue: 3,
      });

      expect(updated.currentValue).toBe(3);
    });

    it('updates completion status', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Complete Task',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      const updated = await store.updateGoal({
        id: goal.id,
        isCompleted: true,
      });

      expect(updated.isCompleted).toBe(true);
    });
  });

  describe('deleteGoal', () => {
    it('deletes a goal', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'To Delete',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.deleteGoal(goal.id);

      const state = useGoalStore.getState();
      expect(state.goals).toHaveLength(0);
    });

    it('removes goal from localStorage', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'To Delete',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.deleteGoal(goal.id);

      const stored = JSON.parse(localStorage.getItem('goals') || '[]');
      expect(stored).toHaveLength(0);
    });
  });

  describe('toggleComplete', () => {
    it('toggles goal completion status', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Toggle Me',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      expect(goal.isCompleted).toBe(false);

      await store.toggleComplete(goal.id);
      const state1 = useGoalStore.getState();
      expect(state1.goals[0].isCompleted).toBe(true);

      await store.toggleComplete(goal.id);
      const state2 = useGoalStore.getState();
      expect(state2.goals[0].isCompleted).toBe(false);
    });
  });

  describe('updateProgress', () => {
    it('updates numeric progress value', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Run 10 miles',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.NUMERIC,
        targetValue: 10,
        unit: 'miles',
      });

      await store.updateProgress(goal.id, 5);

      const state = useGoalStore.getState();
      expect(state.goals[0].currentValue).toBe(5);
    });
  });

  describe('selectors', () => {
    beforeEach(async () => {
      const store = useGoalStore.getState();

      // Create goals of different types
      await store.createGoal({
        title: 'Yearly Goal',
        goalType: GoalType.YEARLY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.createGoal({
        title: 'Monthly Goal',
        goalType: GoalType.MONTHLY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.createGoal({
        title: 'Weekly Goal',
        goalType: GoalType.WEEKLY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.createGoal({
        title: 'Daily Goal',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });
    });

    it('getGoalsByType returns goals of specific type', () => {
      const store = useGoalStore.getState();

      const yearlyGoals = store.getGoalsByType(GoalType.YEARLY);
      expect(yearlyGoals).toHaveLength(1);
      expect(yearlyGoals[0].title).toBe('Yearly Goal');

      const dailyGoals = store.getGoalsByType(GoalType.DAILY);
      expect(dailyGoals).toHaveLength(1);
      expect(dailyGoals[0].title).toBe('Daily Goal');
    });

    it('getGoalsByParent returns child goals', async () => {
      const store = useGoalStore.getState();

      const parentGoal = await store.createGoal({
        title: 'Parent',
        goalType: GoalType.YEARLY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.createGoal({
        title: 'Child 1',
        goalType: GoalType.MONTHLY,
        trackingType: TrackingType.CHECKBOX,
        parentGoalId: parentGoal.id,
      });

      await store.createGoal({
        title: 'Child 2',
        goalType: GoalType.MONTHLY,
        trackingType: TrackingType.CHECKBOX,
        parentGoalId: parentGoal.id,
      });

      const children = store.getGoalsByParent(parentGoal.id);
      expect(children).toHaveLength(2);
    });

    it('calculateProgress returns 100 for completed goals', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Completed',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.toggleComplete(goal.id);

      const progress = useGoalStore.getState().calculateProgress(goal.id);
      expect(progress).toBe(100);
    });

    it('calculateProgress returns percentage for numeric goals', async () => {
      const store = useGoalStore.getState();
      const goal = await store.createGoal({
        title: 'Run 10 miles',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.NUMERIC,
        targetValue: 10,
        unit: 'miles',
      });

      await store.updateProgress(goal.id, 5);

      const progress = useGoalStore.getState().calculateProgress(goal.id);
      expect(progress).toBe(50);
    });

    it('getGoalsByParent correctly filters children', async () => {
      const store = useGoalStore.getState();

      const parent = await store.createGoal({
        title: 'Parent',
        goalType: GoalType.WEEKLY,
        trackingType: TrackingType.CHECKBOX,
      });

      await store.createGoal({
        title: 'Child 1',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
        parentGoalId: parent.id,
      });

      await store.createGoal({
        title: 'Child 2',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
        parentGoalId: parent.id,
      });

      // Verify children are correctly associated
      const children = store.getGoalsByParent(parent.id);
      expect(children).toHaveLength(2);
      expect(children.map(c => c.title)).toContain('Child 1');
      expect(children.map(c => c.title)).toContain('Child 2');
    });
  });
});
