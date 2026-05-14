import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Zap, Bell, X, User, Settings, LogOut, CheckCircle2, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { FrameOutLogo } from '../../../components/FrameOutLogo';
import { markNotificationsRead, clearNotifications } from '../state/user.store';

export default function Navbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const stats = useSelector(s => s.user.userStats.data);
  const { list: notifications, unreadCount } = useSelector(s => s.user.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mark as read when opening
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
      dispatch(markNotificationsRead());
    }
  }, [showNotifications, unreadCount, dispatch]);

  const getNotifIcon = (type, severity) => {
    if (type === 'deadline' || severity === 'high') return <AlertTriangle size={14} className="text-red-400" />;
    if (type === 'success') return <CheckCircle2 size={14} className="text-green-400" />;
    if (type === 'task') return <Zap size={14} className="text-accent" />;
    return <Clock size={14} className="text-orange-400" />;
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar}
            className="p-2 hover:bg-white/5 rounded-xl text-[#849495] hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <FrameOutLogo size={20} />
            <span className="hidden sm:inline-block text-white font-bold tracking-tight">Frame-Out</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Quick Stats */}
          {stats && (
            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/4 border border-white/5">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-accent" fill="currentColor" />
                <span className="text-[11px] font-bold text-white">{stats.xp} XP</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5 text-orange-400">
                <span className="text-[11px] font-bold">{stats.currentStreak}d Streak</span>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 transition-all relative rounded-xl ${showNotifications ? 'bg-white/5 text-accent' : 'text-[#849495] hover:text-white hover:bg-white/5'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-accent text-[#080808] text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#080808] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Tray */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                  <div className="absolute top-12 right-0 w-80 glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Operational Intel</h3>
                        {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[8px] font-bold">NEW</span>}
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => dispatch(clearNotifications())}
                           title="Clear History"
                           className="p-1 text-[#849495] hover:text-red-400 transition-colors">
                           <Trash2 size={12} />
                         </button>
                         <button onClick={() => setShowNotifications(false)}><X size={14} className="text-[#849495]" /></button>
                      </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bell size={24} className="mx-auto text-white/5 mb-2" />
                          <p className="text-[10px] text-[#849495] uppercase tracking-widest">No active logs</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-accent/[0.02]' : ''}`}>
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />}
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10`}>
                                {getNotifIcon(n.type, n.severity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] text-white font-bold truncate">{n.title}</p>
                                  <span className="text-[9px] text-[#555] font-mono whitespace-nowrap">{formatTime(n.createdAt)}</span>
                                </div>
                                <p className="text-[10px] text-[#849495] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="w-full p-3 text-[10px] text-accent font-bold hover:bg-accent/5 transition-colors uppercase tracking-widest border-t border-white/5">
                        Close Intel Buffer
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* User Profile Summary */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 pl-2 cursor-pointer group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white leading-tight group-hover:text-accent transition-colors">{user?.fullname || 'User'}</p>
              <p className="text-[10px] text-[#849495] uppercase tracking-wider">{user?.role || 'Member'}</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center text-accent text-xs font-bold group-hover:border-accent group-hover:scale-105 transition-all">
              {(user?.fullname || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


