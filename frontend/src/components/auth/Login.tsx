import { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store';

interface LoginProps {
  onSwitchToSignup: () => void;
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await signIn(email, password);
      addToast('success', 'Welcome back! 🎉');
      onSuccess();
    } catch (err) {
      addToast('error', error || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full p-4 mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 text-lg">Sign in to continue your journey 🚀</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-danger-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        {/* Local Mode Notice */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            💡 No Supabase configured? You can still use the app in local mode!
          </p>
        </div>
      </div>
    </div>
  );
};
