import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import XPCelebration from './XPCelebration';
import { useSoundAlerts } from '../hook/useSoundAlerts';
import { setTheme } from '../state/user.store';

const THEMES = {
  electric: '#00F5FF',
  emerald:  '#10b981',
  crimson:  '#ef4444',
  purple:   '#a855f7',
  orange:   '#f97316',
  arctic:   '#e2e8f0',
};

export default function AppLayout() {
  const theme    = useSelector(s => s.user.theme);
  const stats    = useSelector(s => s.user.userStats.data);
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  
  const { playLevelUp } = useSoundAlerts();
  const prevLevelRef = React.useRef(stats?.level);

  // Apply theme to :root on change
  useEffect(() => {
    const map = {
      electric: { accent: '#00F5FF', glow: 'rgba(0,245,255,0.15)', dim: 'rgba(0,245,255,0.06)', border: 'rgba(0,245,255,0.3)' },
      emerald:  { accent: '#10b981', glow: 'rgba(16,185,129,0.15)', dim: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.3)' },
      crimson:  { accent: '#ef4444', glow: 'rgba(239,68,68,0.15)',  dim: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.3)' },
      purple:   { accent: '#a855f7', glow: 'rgba(168,85,247,0.15)', dim: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.3)' },
      orange:   { accent: '#f97316', glow: 'rgba(249,115,22,0.15)', dim: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.3)' },
      arctic:   { accent: '#e2e8f0', glow: 'rgba(226,232,240,0.12)',dim: 'rgba(226,232,240,0.05)',border: 'rgba(226,232,240,0.25)'},
    };
    const t = map[theme] || map.electric;
    const root = document.documentElement;
    root.style.setProperty('--theme-accent',        t.accent);
    root.style.setProperty('--theme-accent-glow',   t.glow);
    root.style.setProperty('--theme-accent-dim',    t.dim);
    root.style.setProperty('--theme-accent-border', t.border);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Level-Up Detection
  useEffect(() => {
    if (stats?.level && prevLevelRef.current && stats.level > prevLevelRef.current) {
      setLevelUpData({
        level: stats.level,
        xp: 100, // Visual placeholder for the "Level Up" XP reward
      });
      playLevelUp();
    }
    if (stats?.level) prevLevelRef.current = stats.level;
  }, [stats?.level, playLevelUp]);

  // Mark activity on mount
  useEffect(() => {
    const track = async () => {
      try {
        const { userService } = await import('../service/user.service');
        await userService.markActive();
      } catch (e) {
        console.warn('Activity tracking failed:', e.message);
      }
    };
    track();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="glow-orb w-96 h-96 -top-32 -right-32 opacity-20"
             style={{ background: 'var(--theme-accent)' }} />
        <div className="glow-orb w-64 h-64 bottom-0 left-60 opacity-10"
             style={{ background: 'var(--theme-accent)' }} />
      </div>

      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Global Celebration Overlay */}
      {levelUpData && (
        <XPCelebration 
          xp={levelUpData.xp}
          level={levelUpData.level}
          isLevelUp={true}
          onDone={() => setLevelUpData(null)}
        />
      )}

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="min-h-screen relative z-10 w-full overflow-x-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
