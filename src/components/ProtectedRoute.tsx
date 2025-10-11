import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AuthLoadingScreen from '@/components/ui/auth-loading-screen'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (!allowedRoles.includes(user.userType || '')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}