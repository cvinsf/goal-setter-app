import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,

        signUp: async (email: string, password: string, name: string) => {
          set({ isLoading: true, error: null });

          try {
            if (!isSupabaseConfigured()) {
              throw new Error('Authentication requires Supabase configuration');
            }

            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name,
                },
              },
            });

            if (error) throw error;

            if (data.user) {
              const user: User = {
                id: data.user.id,
                email: data.user.email,
                createdAt: new Date(data.user.created_at!),
                subscriptionTier: 'free',
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to sign up',
              isLoading: false,
            });
            throw error;
          }
        },

        signIn: async (email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            if (!isSupabaseConfigured()) {
              // Local mode - create a local user
              const localUser: User = {
                id: 'local-user',
                email,
                createdAt: new Date(),
                subscriptionTier: 'free',
              };

              set({
                user: localUser,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            if (data.user) {
              const user: User = {
                id: data.user.id,
                email: data.user.email,
                createdAt: new Date(data.user.created_at!),
                subscriptionTier: 'free', // Default, should be fetched from database
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to sign in',
              isLoading: false,
            });
            throw error;
          }
        },

        signOut: async () => {
          try {
            if (isSupabaseConfigured()) {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            }

            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to sign out',
            });
            throw error;
          }
        },

        resetPassword: async (email: string) => {
          set({ isLoading: true, error: null });

          try {
            if (!isSupabaseConfigured()) {
              throw new Error('Password reset requires Supabase configuration');
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            set({ isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to reset password',
              isLoading: false,
            });
            throw error;
          }
        },

        updateProfile: async (updates: Partial<User>) => {
          set({ isLoading: true, error: null });

          try {
            const currentUser = get().user;
            if (!currentUser) throw new Error('No user logged in');

            if (isSupabaseConfigured()) {
              // Update user metadata in Supabase
              const { error } = await supabase.auth.updateUser({
                data: updates,
              });

              if (error) throw error;
            }

            set({
              user: { ...currentUser, ...updates },
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update profile',
              isLoading: false,
            });
            throw error;
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });

          try {
            if (!isSupabaseConfigured()) {
              // Check if there's a local user
              const currentState = get();
              if (currentState.user) {
                set({ isAuthenticated: true, isLoading: false });
              } else {
                set({ isAuthenticated: false, isLoading: false });
              }
              return;
            }

            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
              const user: User = {
                id: data.session.user.id,
                email: data.session.user.email,
                createdAt: new Date(data.session.user.created_at!),
                subscriptionTier: 'free',
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to check authentication',
              isLoading: false,
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
