import { Navigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery } from '@/store/api/authApi';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If there's an error or no user, redirect to login
  if (error || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not an admin, redirect to home
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
} 