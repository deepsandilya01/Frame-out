import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app.routes';
import { useCurrentUser } from '../features/auth/hook/useAuthHooks';
import SplashScreen from '../components/SplashScreen';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  // This hook will check for existing session on app load
  const { isLoading: authLoading } = useCurrentUser();
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has already been shown in this session
    return !sessionStorage.getItem('splash_shown');
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splash_shown', 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#849495] animate-pulse tracking-widest text-sm uppercase">Synchronizing Systems...</div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#151d1d',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#151d1d',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#151d1d',
            },
          },
        }}
      />
      <AppContent />
    </>
  );
}

export default App;
