import React, { useState } from 'react';
import { Header } from './Header';
import { SidePanel } from './SidePanel';
import { GoalType, type Goal } from '../../types';

export interface LayoutProps {
  children: React.ReactNode;
  yearlyGoals?: Goal[];
  monthlyGoals?: Goal[];
  weeklyGoals?: Goal[];
  unreadNotifications?: number;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onSelectGoal?: (goal: Goal) => void;
  calculateProgress?: (goalId: string) => number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  yearlyGoals = [],
  monthlyGoals = [],
  weeklyGoals = [],
  unreadNotifications = 0,
  onOpenSettings,
  onOpenNotifications,
  onSelectGoal = () => {},
  calculateProgress = () => 0,
}) => {
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        onOpenSettings={onOpenSettings}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={onOpenNotifications}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Side Panel */}
        <SidePanel
          isOpen={sidePanelOpen}
          yearlyGoals={yearlyGoals}
          monthlyGoals={monthlyGoals}
          weeklyGoals={weeklyGoals}
          selectedGoalType={selectedGoalType}
          onSelectGoalType={setSelectedGoalType}
          onSelectGoal={onSelectGoal}
          calculateProgress={calculateProgress}
        />
      </div>

      {/* Side Panel Toggle Button (Mobile) */}
      <button
        onClick={() => setSidePanelOpen(!sidePanelOpen)}
        className="fixed bottom-4 right-4 md:hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-30"
        aria-label={sidePanelOpen ? 'Close side panel' : 'Open side panel'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {sidePanelOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
    </div>
  );
};
