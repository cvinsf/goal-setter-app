import React from 'react';
import { GoalType, GOAL_TYPE_LABELS, type Goal } from '../../types';
import { cn, calculatePercentage } from '../../utils';
import { Badge, ProgressBar } from '../ui';

export interface SidePanelProps {
  isOpen: boolean;
  yearlyGoals: Goal[];
  monthlyGoals: Goal[];
  weeklyGoals: Goal[];
  selectedGoalType: GoalType | null;
  onSelectGoalType: (type: GoalType) => void;
  onSelectGoal: (goal: Goal) => void;
  calculateProgress: (goalId: string) => number;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  yearlyGoals,
  monthlyGoals,
  weeklyGoals,
  selectedGoalType,
  onSelectGoalType,
  onSelectGoal,
  calculateProgress,
}) => {
  const goalSections = [
    { type: GoalType.YEARLY, goals: yearlyGoals, icon: '📅' },
    { type: GoalType.MONTHLY, goals: monthlyGoals, icon: '📆' },
    { type: GoalType.WEEKLY, goals: weeklyGoals, icon: '📋' },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-l border-primary-200 transition-all duration-300',
        'w-80 flex-shrink-0',
        !isOpen && 'w-16'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary-200">
        {isOpen ? (
          <h2 className="text-lg font-semibold text-primary-900">Goal Overview</h2>
        ) : (
          <div className="flex justify-center">
            <span className="text-2xl">🎯</span>
          </div>
        )}
      </div>

      {/* Goal Sections */}
      <div className="flex-1 overflow-y-auto">
        {goalSections.map(({ type, goals, icon }) => (
          <div key={type} className="border-b border-primary-200">
            <button
              onClick={() => onSelectGoalType(selectedGoalType === type ? null : type)}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between',
                'hover:bg-primary-50 transition-colors',
                selectedGoalType === type && 'bg-primary-100'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                {isOpen && (
                  <span className="font-medium text-primary-900">
                    {GOAL_TYPE_LABELS[type]}
                  </span>
                )}
              </div>
              {isOpen && (
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">
                    {goals.length}
                  </Badge>
                  <svg
                    className={cn(
                      'w-4 h-4 text-primary-600 transition-transform',
                      selectedGoalType === type && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Goal List */}
            {isOpen && selectedGoalType === type && (
              <div className="bg-primary-50/50">
                {goals.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-primary-600">
                    No {type} goals yet
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {goals.map((goal) => {
                      const progress = calculateProgress(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => onSelectGoal(goal)}
                          className="w-full text-left p-3 rounded-lg bg-white hover:bg-primary-100 border border-primary-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm text-primary-900 line-clamp-2">
                              {goal.title}
                            </h4>
                            {goal.isCompleted && (
                              <Badge variant="success" size="sm">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <ProgressBar
                            value={progress}
                            size="sm"
                            showLabel={false}
                            animated={false}
                          />
                          <div className="mt-1 text-xs text-primary-600">
                            {Math.round(progress)}% complete
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - Add Goal Button */}
      {isOpen && (
        <div className="p-4 border-t border-primary-200">
          <button className="w-full px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors font-medium">
            + Add Goal
          </button>
        </div>
      )}
    </aside>
  );
};
