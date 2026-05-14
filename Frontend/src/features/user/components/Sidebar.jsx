import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, CheckSquare, Timer, BarChart3, Activity,
  Bot, Trophy, User, Settings, LogOut, Zap, Flame, Smile, BookOpen, Clock,
  Menu, X, ShieldAlert
} from 'lucide-react';
import { useAppLogout } from '../hook/useUserProfile';
import { FrameOutLogo } from '../../../components/FrameOutLogo';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',       icon: CheckSquare,      label: 'Tasks' },
  { to: '/focus',       icon: Timer,            label: 'Focus' },
  { to: '/insights',    icon: BarChart3,        label: 'Insights' }, // Merged Heatmap/Analytics/History
  { to: '/ai-coach',    icon: Bot,              label: 'AI Coach' },
  { to: '/reflect',     icon: BookOpen,         label: 'Reflect' },  // Merged Journal/Mood
];

const BOTTOM_NAV = [
  { to: '/profile',    icon: User,              label: 'Profile' },
  { to: '/leaderboard',icon: Trophy,            label: 'Leaderboard' },
  { to: '/settings',   icon: Settings,          label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
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
        onClick={onClose}
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
    <>
      <aside className={`fixed top-0 h-screen w-60 flex flex-col z-50 transition-all duration-300 border-r border-white/5 ${
        isOpen ? 'left-0' : '-left-full'
      }`}
      style={{ background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute top-5 right-4 text-[#849495] hover:text-white"
        >
          <X size={20} aria-hidden="true" />
        </button>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <FrameOutLogo className="text-white" size={24} />
          <span className="text-white font-bold text-lg tracking-tight">
            Frame-Out
          </span>
        </div>
      </div>

      <div className="divider-laser mx-4" />

      {/* Main Nav */}
      <nav id="sidebar-nav" aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
        {(user?.role === 'admin' || user?.email === 'admin@admin.com') && (
          <NavItem to="/admin" icon={ShieldAlert} label="Admin Panel" />
        )}
      </nav>

      <div className="divider-laser mx-4" />

      {/* Bottom Nav */}
      <nav aria-label="Secondary navigation" className="px-3 py-2 space-y-0.5">
        {BOTTOM_NAV.map(item => <NavItem key={item.to} {...item} />)}

        <button
          onClick={onLogout}
          disabled={loggingOut}
          aria-label="Logout from Frame-Out"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#849495] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={16} aria-hidden="true" />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <NavLink to="/profile" onClick={() => setIsOpen(false)} className="block glass rounded-xl p-3 space-y-2 hover:border-accent/40 transition-all hover-lift group">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110"
                 style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--theme-accent)' }}>
              {(user?.fullname || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[#dce4e4] text-xs font-medium truncate group-hover:text-white transition-colors">{user?.fullname || 'User'}</p>
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
        </NavLink>
      </div>
      </aside>
    </>
  );
}
