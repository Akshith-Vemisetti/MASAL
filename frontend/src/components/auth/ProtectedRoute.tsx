import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'customer' | 'salesperson';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If wrong role, redirect to appropriate dashboard
    return <Navigate to={user.role === 'customer' ? '/customer' : '/salesperson'} replace />;
  }

  return <>{children}</>;
}
