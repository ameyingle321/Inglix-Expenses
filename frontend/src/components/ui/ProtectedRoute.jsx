import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from './LoadingSkeleton';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen p-8 bg-brand-light"><LoadingSkeleton type="full" /></div>;
  if (!user) return <Navigate to="/" replace />;
  
  return children;
};

export const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};
