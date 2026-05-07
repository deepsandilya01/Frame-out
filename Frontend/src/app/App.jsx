import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app.routes';
import { useCurrentUser } from '../features/auth/hook/useAuthHooks';

const AppContent = () => {
  // This hook will check for existing session on app load
  const { isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-text-secondary animate-pulse tracking-widest text-sm">INITIALIZING SANCTUARY</div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <AppContent />
  );
}

export default App;
