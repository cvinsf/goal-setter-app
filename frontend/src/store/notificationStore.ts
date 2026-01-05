import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Notification, NotificationType, WeeklySummary } from '../types';
import { storage, generateId } from '../utils';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createWeeklySummary: (summary: WeeklySummary) => Promise<void>;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Selectors
  getUnreadCount: () => number;
}

const STORAGE_KEY = 'notifications';

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      loading: false,
      error: null,

      fetchNotifications: async () => {
        set({ loading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) {
              const localNotifications = storage.get<Notification[]>(STORAGE_KEY, []);
              set({ notifications: localNotifications, loading: false });
              return;
            }

            const { data, error } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', user.user.id)
              .order('created_at', { ascending: false })
              .limit(50);

            if (error) throw error;

            const notifications: Notification[] = (data || []).map((row) => ({
              id: row.id,
              userId: row.user_id,
              title: row.title,
              message: row.message,
              type: row.type as NotificationType,
              isRead: row.is_read,
              createdAt: new Date(row.created_at),
            }));

            set({ notifications, loading: false });
          } else {
            const localNotifications = storage.get<Notification[]>(STORAGE_KEY, []);
            set({ notifications: localNotifications, loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch notifications',
            loading: false,
          });
        }
      },

      markAsRead: async (id) => {
        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase
              .from('notifications')
              .update({ is_read: true })
              .eq('id', id);

            if (error) throw error;

            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              ),
            }));
          } else {
            set((state) => {
              const newNotifications = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              );
              storage.set(STORAGE_KEY, newNotifications);
              return { notifications: newNotifications };
            });
          }
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        try {
          if (isSupabaseConfigured()) {
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) return;

            const { error } = await supabase
              .from('notifications')
              .update({ is_read: true })
              .eq('user_id', user.user.id)
              .eq('is_read', false);

            if (error) throw error;

            set((state) => ({
              notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            }));
          } else {
            set((state) => {
              const newNotifications = state.notifications.map((n) => ({
                ...n,
                isRead: true,
              }));
              storage.set(STORAGE_KEY, newNotifications);
              return { notifications: newNotifications };
            });
          }
        } catch (error) {
          console.error('Failed to mark all as read:', error);
        }
      },

      createWeeklySummary: async (summary) => {
        const message = `
You completed ${summary.completedDailyGoals} out of ${summary.totalDailyGoals} daily goals this week (${summary.completionPercentage}%)!

This contributed ${summary.contributionToMonthly.toFixed(1)}% to your monthly goals and ${summary.contributionToYearly.toFixed(1)}% to your yearly goals.

Keep up the great work!
        `.trim();

        await get().addNotification(
          'weekly_summary',
          'Weekly Progress Summary',
          message,
          {
            weekStartDate: summary.weekStartDate.toISOString(),
            weekEndDate: summary.weekEndDate.toISOString(),
            ...summary,
          }
        );
      },

      addNotification: async (type, title, message, metadata) => {
        try {
          if (isSupabaseConfigured()) {
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) return;

            const { data, error } = await supabase
              .from('notifications')
              .insert({
                user_id: user.user.id,
                type,
                title,
                message,
              })
              .select()
              .single();

            if (error) throw error;

            const notification: Notification = {
              id: data.id,
              userId: data.user_id,
              title: data.title,
              message: data.message,
              type: data.type as NotificationType,
              isRead: data.is_read,
              createdAt: new Date(data.created_at),
              metadata,
            };

            set((state) => ({
              notifications: [notification, ...state.notifications],
            }));
          } else {
            const notification: Notification = {
              id: generateId(),
              userId: 'local-user',
              title,
              message,
              type,
              isRead: false,
              createdAt: new Date(),
              metadata,
            };

            set((state) => {
              const newNotifications = [notification, ...state.notifications];
              storage.set(STORAGE_KEY, newNotifications);
              return { notifications: newNotifications };
            });
          }
        } catch (error) {
          console.error('Failed to add notification:', error);
        }
      },

      deleteNotification: async (id) => {
        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.from('notifications').delete().eq('id', id);

            if (error) throw error;

            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
          } else {
            set((state) => {
              const newNotifications = state.notifications.filter((n) => n.id !== id);
              storage.set(STORAGE_KEY, newNotifications);
              return { notifications: newNotifications };
            });
          }
        } catch (error) {
          console.error('Failed to delete notification:', error);
        }
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    { name: 'notification-store' }
  )
);
