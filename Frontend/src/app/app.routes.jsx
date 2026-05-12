import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth pages
import LandingPage      from '../features/auth/pages/LandingPage';
import LoginPage        from '../features/auth/pages/LoginPage';
import RegisterPage     from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage  from '../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage    from '../features/auth/pages/VerifyEmailPage';
import LegalPage          from '../features/auth/pages/LegalPage';
import TeamPage           from '../features/auth/pages/TeamPage';

// App Layout + User Pages
import AppLayout        from '../features/user/components/AppLayout';
import DashboardPage    from '../features/user/pages/DashboardPage';
import TasksPage        from '../features/user/pages/TasksPage';
import FocusPage        from '../features/user/pages/FocusPage';
import InsightsPage     from '../features/user/pages/InsightsPage';
import ReflectPage      from '../features/user/pages/ReflectPage';
import AICoachPage      from '../features/user/pages/AICoachPage';
import LeaderboardPage  from '../features/user/pages/LeaderboardPage';
import ProfilePage      from '../features/user/pages/ProfilePage';
import SettingsPage     from '../features/user/pages/SettingsPage';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(s => s.auth);
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(s => s.auth);
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
    </div>
  );
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export const router = createBrowserRouter([
  // Public
  { path: '/',                element: <PublicOnlyRoute><LandingPage /></PublicOnlyRoute> },
  { path: '/login',           element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/register',        element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute> },
  { path: '/reset-password',  element: <PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute> },
  { path: '/verify-email',    element: <PublicOnlyRoute><VerifyEmailPage /></PublicOnlyRoute> },
  { path: '/legal/:type',     element: <LegalPage /> },
  { path: '/team',            element: <TeamPage /> },

  // Protected — all wrapped in AppLayout (sidebar)
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { path: 'dashboard',   element: <DashboardPage /> },
      { path: 'tasks',       element: <TasksPage /> },
      { path: 'focus',       element: <FocusPage /> },
      { path: 'insights',    element: <InsightsPage /> },
      { path: 'reflect',     element: <ReflectPage /> },
      { path: 'ai-coach',    element: <AICoachPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile',      element: <ProfilePage /> },
      { path: 'settings',     element: <SettingsPage /> },
      // Redirects for backward compatibility (optional but good for stability)
      { path: 'analytics',   element: <Navigate to="/insights" replace /> },
      { path: 'heatmap',     element: <Navigate to="/insights" replace /> },
      { path: 'history',     element: <Navigate to="/insights" replace /> },
      { path: 'mood',         element: <Navigate to="/reflect" replace /> },
      { path: 'journal',      element: <Navigate to="/reflect" replace /> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
