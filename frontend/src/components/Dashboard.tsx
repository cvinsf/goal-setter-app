import { useEffect, useState } from 'react';
import { Layout } from './layout';
import { Button, Modal, ModalFooter, Input, Select, Textarea, Card, CardContent, ProgressBar, Checkbox, Badge } from './ui';
import { ToastContainer } from './ui/Toast';
import { useGoalStore, useNotificationStore, useToastStore } from '../store';
import { GoalType, TrackingType, GOAL_TYPE_LABELS, TRACKING_TYPE_LABELS } from '../types';
import { formatDate, getDaysRemaining, cn } from '../utils';

export const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    goalType: GoalType;
    trackingType: TrackingType;
    targetValue: string;
    unit: string;
  }>({
    title: '',
    description: '',
    goalType: GoalType.DAILY,
    trackingType: TrackingType.CHECKBOX,
    targetValue: '',
    unit: '',
  });

  const {
    loading,
    fetchGoals,
    createGoal,
    deleteGoal,
    toggleComplete,
    updateProgress,
    getGoalsByType,
    calculateProgress,
  } = useGoalStore();

  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationStore();

  const { toasts, addToast, removeToast } = useToastStore();

  useEffect(() => {
    fetchGoals();
    fetchNotifications();
  }, [fetchGoals, fetchNotifications]);

  const dailyGoals = getGoalsByType(GoalType.DAILY);
  const weeklyGoals = getGoalsByType(GoalType.WEEKLY);
  const monthlyGoals = getGoalsByType(GoalType.MONTHLY);
  const yearlyGoals = getGoalsByType(GoalType.YEARLY);

  const handleCreateGoal = async () => {
    try {
      await createGoal({
        title: formData.title,
        description: formData.description,
        goalType: formData.goalType,
        trackingType: formData.trackingType,
        targetValue: formData.targetValue ? Number(formData.targetValue) : undefined,
        unit: formData.unit || undefined,
        startDate: new Date(),
      });

      addToast('success', 'Goal created successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        goalType: GoalType.DAILY,
        trackingType: TrackingType.CHECKBOX,
        targetValue: '',
        unit: '',
      });
    } catch (error) {
      addToast('error', 'Failed to create goal');
    }
  };

  const handleToggleGoal = async (goalId: string) => {
    try {
      await toggleComplete(goalId);
      addToast('success', 'Goal updated!');
    } catch (error) {
      addToast('error', 'Failed to update goal');
    }
  };

  const handleUpdateProgress = async (goalId: string, value: number) => {
    try {
      await updateProgress(goalId, value);
      addToast('success', 'Progress updated!');
    } catch (error) {
      addToast('error', 'Failed to update progress');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      addToast('success', 'Goal deleted');
    } catch (error) {
      addToast('error', 'Failed to delete goal');
    }
  };

  return (
    <>
      <Layout
        yearlyGoals={yearlyGoals}
        monthlyGoals={monthlyGoals}
        weeklyGoals={weeklyGoals}
        unreadNotifications={getUnreadCount()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        calculateProgress={calculateProgress}
      >
        {/* Main Dashboard */}
        <div className="space-y-8">
          {/* Hero Header with Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-8 shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    ✨ Today's Goals
                  </h1>
                  <p className="text-primary-100 text-lg">
                    Make today count! Focus on your daily tasks to achieve greatness 🚀
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-primary-600 hover:bg-primary-50 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="text-xl mr-2">+</span> Create Goal
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-accent-400/20 rounded-full blur-3xl"></div>
          </div>

          {/* Daily Goals */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="text-primary-700 mt-4 font-medium">Loading your goals...</p>
            </div>
          ) : dailyGoals.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-12 max-w-md mx-auto shadow-lg">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-primary-900 mb-3">Start Your Journey!</h3>
                <p className="text-primary-600 mb-6">Create your first daily goal and begin achieving amazing things.</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 shadow-lg"
                >
                  <span className="text-xl mr-2">✨</span> Create Your First Goal
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {dailyGoals.map((goal) => {
                const progress = calculateProgress(goal.id);
                const daysLeft = getDaysRemaining(goal.endDate);
                const isOverdue = daysLeft < 0;
                const isDueToday = daysLeft === 0;

                return (
                  <Card
                    key={goal.id}
                    variant="elevated"
                    className={cn(
                      "transition-all duration-300 hover:shadow-2xl border-l-4",
                      goal.isCompleted
                        ? "border-l-success-500 bg-gradient-to-r from-success-50/50 to-white"
                        : isOverdue
                        ? "border-l-danger-500 bg-gradient-to-r from-danger-50/30 to-white"
                        : isDueToday
                        ? "border-l-warning-500 bg-gradient-to-r from-warning-50/30 to-white"
                        : "border-l-primary-500 bg-white"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={goal.isCompleted}
                            onChange={() => handleToggleGoal(goal.id)}
                            className="mt-1 scale-125"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className={cn(
                                    'text-xl font-bold',
                                    goal.isCompleted
                                      ? 'line-through text-success-600'
                                      : 'text-gray-900'
                                  )}
                                >
                                  {goal.title}
                                </h3>
                                {goal.isCompleted && <span className="text-2xl animate-bounce">🎉</span>}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {goal.description}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              {goal.isCompleted ? (
                                <Badge variant="success" size="md" className="font-semibold shadow-sm">
                                  <span className="mr-1">✓</span> Completed
                                </Badge>
                              ) : isOverdue ? (
                                <Badge variant="danger" size="md" className="font-semibold shadow-sm">
                                  <span className="mr-1">⚠</span> Overdue
                                </Badge>
                              ) : isDueToday ? (
                                <Badge variant="warning" size="md" className="font-semibold shadow-sm">
                                  <span className="mr-1">⏰</span> Due Today
                                </Badge>
                              ) : (
                                <Badge variant="info" size="md" className="font-semibold shadow-sm">
                                  <span className="mr-1">📌</span> In Progress
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar for Numeric/Hybrid */}
                          {(goal.trackingType === TrackingType.NUMERIC ||
                            goal.trackingType === TrackingType.HYBRID) &&
                            goal.targetValue && (
                              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                                  <span className="text-sm font-bold text-primary-600">
                                    {goal.currentValue || 0} / {goal.targetValue} {goal.unit || ''}
                                  </span>
                                </div>
                                <ProgressBar
                                  value={progress}
                                  size="lg"
                                  className="shadow-sm"
                                />

                                {!goal.isCompleted && (
                                  <div className="flex gap-2 mt-3">
                                    <Input
                                      type="number"
                                      placeholder="Update progress..."
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const value = Number(
                                            (e.target as HTMLInputElement).value
                                          );
                                          handleUpdateProgress(goal.id, value);
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      className="bg-primary-600 text-white hover:bg-primary-700"
                                    >
                                      Update
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-4 text-sm font-medium">
                              {goal.endDate && (
                                <span className={cn(
                                  "flex items-center gap-1",
                                  isOverdue ? "text-danger-600" : isDueToday ? "text-warning-600" : "text-gray-600"
                                )}>
                                  <span>📅</span>
                                  {daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : daysLeft === 0
                                    ? 'Due today'
                                    : `Overdue by ${Math.abs(daysLeft)} days`}
                                </span>
                              )}
                              {goal.startDate && (
                                <span className="text-gray-500 flex items-center gap-1">
                                  <span>🕐</span> Started {formatDate(goal.startDate)}
                                </span>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                            >
                              <span className="mr-1">🗑️</span> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Stats Summary */}
          {dailyGoals.length > 0 && (
            <div className="bg-gradient-to-r from-white to-primary-50 rounded-2xl shadow-lg border border-primary-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-accent-600">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📊</span> Today's Progress Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Completed Goals */}
                  <div className="relative overflow-hidden">
                    <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">✓</span>
                        <div className="text-5xl font-bold">
                          {dailyGoals.filter((g) => g.isCompleted).length}
                        </div>
                      </div>
                      <div className="text-success-100 font-medium text-lg">Goals Completed</div>
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>
                  </div>

                  {/* Total Goals */}
                  <div className="relative overflow-hidden">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">🎯</span>
                        <div className="text-5xl font-bold">
                          {dailyGoals.length}
                        </div>
                      </div>
                      <div className="text-primary-100 font-medium text-lg">Total Goals</div>
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="relative overflow-hidden">
                    <div className={cn(
                      "rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow",
                      Math.round((dailyGoals.filter((g) => g.isCompleted).length / dailyGoals.length) * 100) >= 80
                        ? "bg-gradient-to-br from-success-500 to-success-600"
                        : Math.round((dailyGoals.filter((g) => g.isCompleted).length / dailyGoals.length) * 100) >= 50
                        ? "bg-gradient-to-br from-warning-500 to-warning-600"
                        : "bg-gradient-to-br from-accent-500 to-accent-600"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">
                          {Math.round((dailyGoals.filter((g) => g.isCompleted).length / dailyGoals.length) * 100) >= 80 ? "🏆" : "💪"}
                        </span>
                        <div className="text-5xl font-bold">
                          {Math.round(
                            (dailyGoals.filter((g) => g.isCompleted).length /
                              dailyGoals.length) *
                              100
                          )}%
                        </div>
                      </div>
                      <div className="text-white/90 font-medium text-lg">Completion Rate</div>
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Goal"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g., Run 3 miles"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Add more details about your goal..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Goal Type"
            value={formData.goalType}
            onChange={(e) =>
              setFormData({ ...formData, goalType: e.target.value as GoalType })
            }
            options={Object.values(GoalType).map((type) => ({
              value: type,
              label: GOAL_TYPE_LABELS[type],
            }))}
          />

          <Select
            label="Tracking Type"
            value={formData.trackingType}
            onChange={(e) =>
              setFormData({
                ...formData,
                trackingType: e.target.value as TrackingType,
              })
            }
            options={Object.values(TrackingType).map((type) => ({
              value: type,
              label: TRACKING_TYPE_LABELS[type],
            }))}
          />

          {(formData.trackingType === TrackingType.NUMERIC ||
            formData.trackingType === TrackingType.HYBRID) && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Target Value"
                type="number"
                placeholder="e.g., 3"
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData({ ...formData, targetValue: e.target.value })
                }
              />
              <Input
                label="Unit"
                placeholder="e.g., miles"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateGoal} disabled={!formData.title}>
            Create Goal
          </Button>
        </ModalFooter>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
      >
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-primary-600">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-lg border',
                  notification.isRead
                    ? 'bg-white border-primary-200'
                    : 'bg-primary-50 border-primary-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-primary-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-primary-500 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ModalFooter>
          {getUnreadCount() > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button onClick={() => setIsNotificationsOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">About</h3>
            <p className="text-sm text-primary-600">
              Goal Setter App - Version 1.0.0
            </p>
            <p className="text-sm text-primary-600 mt-1">
              Track your goals from yearly objectives down to daily tasks.
            </p>
          </div>

          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">Storage</h3>
            <p className="text-sm text-primary-600">
              Your goals are currently stored locally in your browser.
            </p>
          </div>
        </div>

        <ModalFooter>
          <Button onClick={() => setIsSettingsOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: removeToast,
        }))}
      />
    </>
  );
};
