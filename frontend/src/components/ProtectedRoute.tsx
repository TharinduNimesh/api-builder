import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isActive } from '@/lib/auth';

type Props = {
  children: ReactNode;
  requireActive?: boolean; // whether the route requires is_active true
};

export default function ProtectedRoute({ children, requireActive = true }: Props) {
  if (!isAuthenticated()) return <Navigate to="/signin" replace />;
  if (requireActive && !isActive()) return <Navigate to="/" replace />; // or show pending page
  return <>{children}</>;
}
