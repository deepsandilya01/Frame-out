import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, CheckSquare, Timer, BarChart3, Activity,
  Bot, Trophy, User, Settings, LogOut, Zap, Flame, Smile, BookOpen, Clock,
} from 'lucide-react';
import { useAppLogout } from '../hook/useUserProfile';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',       icon: CheckSquare,      label: 'Tasks' },
  { to: '/focus',       icon: Timer,            label: 'Focus' },
  { to: '/analytics',  icon: BarChart3,         label: 'Analytics' },
  { to: '/mood',       icon: Smile,             label: 'Mood' },
  { to: '/journal',    icon: BookOpen,           label: 'Journal' },
  { to: '/history',    icon: Clock,              label: 'History' },
  { to: '/heatmap',    icon: Activity,          label: 'Heatmap' },
  { to: '/ai-coach',   icon: Bot,               label: 'AI Coach' },
  { to: '/leaderboard',icon: Trophy,            label: 'Leaderboard' },
];

const BOTTOM_NAV = [
  { to: '/profile',  icon: User,     label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { handleLogout } = useAppLogout();
  const user  = useSelector(s => s.auth.user);
  const stats = useSelector(s => s.user.userStats.data);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();

  const onLogout = async () => {
    setLoggingOut(true);
    await handleLogout();
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <NavLink
        to={to}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
          active
            ? 'text-accent bg-accent-dim border border-accent/20'
            : 'text-[#849495] hover:text-[#dce4e4] hover:bg-white/4'
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full"
                style={{ boxShadow: '0 0 8px var(--theme-accent)' }} />
        )}
        <Icon size={16} className={active ? 'text-accent' : 'text-[#849495] group-hover:text-[#dce4e4]'} />
        {label}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
           style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 12px rgba(0,245,255,0.2)' }}>
            <Zap size={14} className="text-accent" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">Frame<span className="text-accent">-Out</span></span>
        </div>
      </div>

      <div className="divider-laser mx-4" />

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      <div className="divider-laser mx-4" />

      {/* Bottom Nav */}
      <nav className="px-3 py-2 space-y-0.5">
        {BOTTOM_NAV.map(item => <NavItem key={item.to} {...item} />)}

        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#849495] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={16} />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <div className="glass rounded-xl p-3 space-y-2">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--theme-accent)' }}>
              {(user?.fullname || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[#dce4e4] text-xs font-medium truncate">{user?.fullname || 'User'}</p>
              <p className="text-[#849495] text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          {/* Streak + XP */}
          {stats && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-orange-400">
                <Flame size={10} /> {stats.currentStreak}d streak
              </span>
              <span className="text-accent font-semibold">Lv.{stats.level} · {stats.xp} XP</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
