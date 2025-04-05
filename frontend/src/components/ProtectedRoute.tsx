import { Navigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { data: user, isLoading } = useGetCurrentUserQuery();

  const isAuthenticated = user?.success && !!user?.data?.user;
  const isAdmin = user?.data?.user?.role === 'admin';

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ielts-blue"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role if required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute; 