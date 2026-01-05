import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ToastMessage } from '../types';
import { generateId } from '../utils';

interface ToastState {
  toasts: ToastMessage[];
  addToast: (
    type: ToastMessage['type'],
    message: string,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toasts: [],

      addToast: (type, message, duration = 5000) => {
        const id = generateId();
        const toast: ToastMessage = {
          id,
          type,
          message,
          duration,
        };

        set((state) => ({
          toasts: [...state.toasts, toast],
        }));
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      clearAll: () => {
        set({ toasts: [] });
      },
    }),
    { name: 'toast-store' }
  )
);
