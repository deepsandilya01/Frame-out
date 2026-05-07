import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from '../features/auth/pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import { useSelector } from 'react-redux';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

// Public Only Route Wrapper (redirects to dashboard if logged in)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" />; // Assuming dashboard is the main app
  
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
  },
  {
    path: '/register',
    element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
  },
  {
    path: '/forgot-password',
    element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>
  },
  {
    path: '/reset-password',
    element: <PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>
  },
  {
    path: '/verify-email',
    element: <PublicOnlyRoute><VerifyEmailPage /></PublicOnlyRoute>
  },
  {
    path: '/dashboard',
    element: <PrivateRoute><div className="min-h-screen bg-background text-white p-12 text-2xl">Welcome to Frame-Out Dashboard!</div></PrivateRoute>
  }
]);
