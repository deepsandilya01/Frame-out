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

// App Layout + User Pages
import AppLayout        from '../features/user/components/AppLayout';
import DashboardPage    from '../features/user/pages/DashboardPage';
import TasksPage        from '../features/user/pages/TasksPage';
import FocusPage        from '../features/user/pages/FocusPage';
import AnalyticsPage    from '../features/user/pages/AnalyticsPage';
import HeatmapPage      from '../features/user/pages/HeatmapPage';
import AICoachPage      from '../features/user/pages/AICoachPage';
import LeaderboardPage  from '../features/user/pages/LeaderboardPage';
import ProfilePage      from '../features/user/pages/ProfilePage';
import SettingsPage     from '../features/user/pages/SettingsPage';
import MoodAnalyticsPage from '../features/user/pages/MoodAnalyticsPage';
import JournalPage      from '../features/user/pages/JournalPage';
import HistoryPage      from '../features/user/pages/HistoryPage';

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
  { path: '/',                element: <LandingPage /> },
  { path: '/login',           element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/register',        element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute> },
  { path: '/reset-password',  element: <PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute> },
  { path: '/verify-email',    element: <PublicOnlyRoute><VerifyEmailPage /></PublicOnlyRoute> },

  // Protected — all wrapped in AppLayout (sidebar)
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { path: 'dashboard',   element: <DashboardPage /> },
      { path: 'tasks',       element: <TasksPage /> },
      { path: 'focus',       element: <FocusPage /> },
      { path: 'analytics',   element: <AnalyticsPage /> },
      { path: 'heatmap',     element: <HeatmapPage /> },
      { path: 'ai-coach',    element: <AICoachPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile',      element: <ProfilePage /> },
      { path: 'settings',     element: <SettingsPage /> },
      { path: 'mood',         element: <MoodAnalyticsPage /> },
      { path: 'journal',      element: <JournalPage /> },
      { path: 'history',      element: <HistoryPage /> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
