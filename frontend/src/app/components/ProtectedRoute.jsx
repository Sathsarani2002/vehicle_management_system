import React from 'react';
import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
