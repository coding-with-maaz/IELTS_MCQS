import { Navigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from '@/store/api/authApi';
import { LoadingSpinner } from './LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { data, isLoading, isError } = useGetCurrentUserQuery();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return <LoadingSpinner centered />;
  }

  // If there's an error or no user data, redirect to login
  if (isError || !data?.success || !data.data?.user) {
    return <Navigate to="/login" replace />;
  }

  // If we have valid user data, render the protected content
  return <>{children}</>;
} 