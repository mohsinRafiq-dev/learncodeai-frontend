import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip checks while loading
    if (isLoading) {
      return;
    }

    // Check 1: User not authenticated - redirect to signin
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNIN + '?redirect=' + encodeURIComponent(location.pathname));
      return;
    }

    // Check 2: User account is unverified (pending) - redirect to email verification
    if (user?.accountStatus === 'pending' || !user?.isEmailVerified) {
      navigate(ROUTES.EMAIL_VERIFICATION + '?email=' + encodeURIComponent(user?.email || ''));
      return;
    }

    // Check 3: User account is suspended - logout and redirect to signin
    if (user?.accountStatus === 'suspended') {
      logout();
      navigate(ROUTES.SIGNIN + '?error=account_suspended');
      return;
    }

    // Check 4: Route requires admin but user is not admin
    if (requireAdmin && user?.role !== 'admin') {
      navigate('/');
      return;
    }

  }, [isAuthenticated, isLoading, user, logout, navigate, location.pathname, requireAdmin]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If any protection condition fails, don't render (will redirect)
  if (
    !isAuthenticated ||
    user?.accountStatus === 'suspended' ||
    user?.accountStatus === 'pending' ||
    !user?.isEmailVerified ||
    (requireAdmin && user?.role !== 'admin')
  ) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}

