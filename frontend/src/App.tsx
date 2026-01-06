import { useState } from 'react';
import { Login, Signup, ProtectedRoute } from './components/auth';
import { Dashboard } from './components/Dashboard';
import { useAuthStore } from './store';

type AuthView = 'login' | 'signup';

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const { isAuthenticated } = useAuthStore();

  const handleAuthSuccess = () => {
    // Authentication successful, the ProtectedRoute will handle rendering
  };

  const handleUnauthenticated = () => {
    // User is not authenticated, show login
    setAuthView('login');
  };

  // If authenticated, show protected dashboard
  if (isAuthenticated) {
    return (
      <ProtectedRoute onUnauthenticated={handleUnauthenticated}>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  // Show authentication screens
  return (
    <>
      {authView === 'login' ? (
        <Login
          onSwitchToSignup={() => setAuthView('signup')}
          onSuccess={handleAuthSuccess}
        />
      ) : (
        <Signup
          onSwitchToLogin={() => setAuthView('login')}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}

export default App;
