import { useEffect, useState } from 'react';
import { Layout } from './components/layout';
import { Button, Modal, ModalFooter, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent, ProgressBar, Checkbox, Badge } from './components/ui';
import { ToastContainer } from './components/ui/Toast';
import { useGoalStore, useNotificationStore, useToastStore } from './store';
import { GoalType, TrackingType, GOAL_TYPE_LABELS, TRACKING_TYPE_LABELS } from './types';
import { formatDate, getDaysRemaining, cn } from './utils';

function App() {
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Daily Goals</h1>
              <p className="text-primary-600 mt-1">
                Focus on today's tasks to achieve your long-term objectives
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Add Goal
            </Button>
          </div>

          {/* Daily Goals */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-600">Loading goals...</p>
            </div>
          ) : dailyGoals.length === 0 ? (
            <Card variant="outlined" className="text-center py-12">
              <p className="text-primary-600 mb-4">No daily goals yet</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Your First Goal
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {dailyGoals.map((goal) => {
                const progress = calculateProgress(goal.id);
                const daysLeft = getDaysRemaining(goal.endDate);

                return (
                  <Card key={goal.id} variant="elevated">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <Checkbox
                          checked={goal.isCompleted}
                          onChange={() => handleToggleGoal(goal.id)}
                          className="mt-1"
                        />

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3
                                className={cn(
                                  'text-lg font-semibold',
                                  goal.isCompleted
                                    ? 'line-through text-primary-500'
                                    : 'text-primary-900'
                                )}
                              >
                                {goal.title}
                              </h3>
                              {goal.description && (
                                <p className="text-sm text-primary-600 mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>

                            {goal.isCompleted && (
                              <Badge variant="success" size="sm">
                                ✓ Complete
                              </Badge>
                            )}
                          </div>

                          {/* Progress Bar for Numeric/Hybrid */}
                          {(goal.trackingType === TrackingType.NUMERIC ||
                            goal.trackingType === TrackingType.HYBRID) &&
                            goal.targetValue && (
                              <div className="mt-4">
                                <ProgressBar
                                  value={progress}
                                  label={`${goal.currentValue || 0} / ${goal.targetValue} ${goal.unit || ''}`}
                                  size="md"
                                />

                                {!goal.isCompleted && (
                                  <div className="flex gap-2 mt-3">
                                    <Input
                                      type="number"
                                      placeholder="Update progress"
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
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-200">
                            <div className="flex items-center gap-4 text-sm text-primary-600">
                              {goal.endDate && (
                                <span>
                                  {daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : daysLeft === 0
                                    ? 'Due today'
                                    : 'Overdue'}
                                </span>
                              )}
                              {goal.startDate && (
                                <span>Started {formatDate(goal.startDate)}</span>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              Delete
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
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-900">
                      {dailyGoals.filter((g) => g.isCompleted).length}
                    </div>
                    <div className="text-sm text-primary-600 mt-1">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-900">
                      {dailyGoals.length}
                    </div>
                    <div className="text-sm text-primary-600 mt-1">Total Goals</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-900">
                      {Math.round(
                        (dailyGoals.filter((g) => g.isCompleted).length /
                          dailyGoals.length) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-primary-600 mt-1">Completion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
}

export default App;
