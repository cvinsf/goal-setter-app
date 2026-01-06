import React from 'react';
import { Badge } from '../ui';
import { useAuthStore } from '../../store';
import { useToastStore } from '../../store/toastStore';

export interface HeaderProps {
  onOpenSettings?: () => void;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  unreadNotifications = 0,
  onOpenNotifications,
}) => {
  const { user, signOut } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('success', 'Signed out successfully');
    } catch (error) {
      addToast('error', 'Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-700">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-900">Goal Setter</h1>
              <p className="text-xs text-primary-600">Achieve your dreams, one goal at a time</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-primary-900">{user.email}</span>
              </div>
            )}

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative rounded-lg p-2 text-primary-600 hover:bg-primary-100 hover:text-primary-900 transition-colors"
              aria-label="Notifications"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadNotifications > 0 && (
                <Badge
                  variant="danger"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="rounded-lg p-2 text-primary-600 hover:bg-primary-100 hover:text-primary-900 transition-colors"
              aria-label="Settings"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-danger-600 hover:bg-danger-50 hover:text-danger-700 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
