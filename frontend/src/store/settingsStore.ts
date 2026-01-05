import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LLMProvider, SubscriptionTier } from '../types';

interface SettingsState {
  subscriptionTier: SubscriptionTier;
  apiKeys: Record<LLMProvider, string | null>;
  preferences: {
    showCompletedGoals: boolean;
    enableNotifications: boolean;
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  };

  // Actions
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setAPIKey: (provider: LLMProvider, key: string) => void;
  removeAPIKey: (provider: LLMProvider) => void;
  updatePreferences: (preferences: Partial<SettingsState['preferences']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        subscriptionTier: SubscriptionTier.FREE,
        apiKeys: {
          [LLMProvider.OPENAI]: null,
          [LLMProvider.ANTHROPIC]: null,
          [LLMProvider.GOOGLE]: null,
        },
        preferences: {
          showCompletedGoals: true,
          enableNotifications: true,
          weekStartsOn: 0, // Sunday
        },

        setSubscriptionTier: (tier) => {
          set({ subscriptionTier: tier });
        },

        setAPIKey: (provider, key) => {
          set((state) => ({
            apiKeys: {
              ...state.apiKeys,
              [provider]: key,
            },
          }));
        },

        removeAPIKey: (provider) => {
          set((state) => ({
            apiKeys: {
              ...state.apiKeys,
              [provider]: null,
            },
          }));
        },

        updatePreferences: (preferences) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              ...preferences,
            },
          }));
        },
      }),
      {
        name: 'settings-storage',
      }
    ),
    { name: 'settings-store' }
  )
);
