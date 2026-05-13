import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Zap, Flame, Award, Clock, Target } from 'lucide-react';
import { useUserStats } from '../hook/useUserStats';

const BADGE_ICONS = { default: '🏅', streak: '🔥', focus: '⚡', level: '⭐', master: '👑', zen: '🧘', night: '🌙', early: '🌅' };

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Badge({ badge }) {
  const icon = Object.keys(BADGE_ICONS).find(k => badge.badgeId?.includes(k)) || 'default';
  return (
    <div className={`glass rounded-xl p-3 text-center transition-all hover-lift ${badge.earned ? 'border-accent/20' : 'opacity-40'}`}
         style={badge.earned ? { border: '1px solid rgba(0,245,255,0.2)' } : {}}>
      <div className="text-2xl mb-1">{BADGE_ICONS[icon]}</div>
      <p className="text-xs font-medium text-[#dce4e4] leading-tight">{badge.name || badge.badgeId}</p>
      {badge.earned && badge.earnedAt && (
        <p className="text-[10px] text-[#849495] mt-0.5">
          {formatDate(badge.earnedAt)}
        </p>
      )}
      {!badge.earned && <p className="text-[10px] text-[#849495] mt-0.5">Locked</p>}
    </div>
  );
}

function XPBar({ stats }) {
  const xp = stats?.xp || 0;
  const level = stats?.level || 1;
  const currentLevelXp = stats?.currentLevelXp || 0;
  const nextLevelXp = stats?.nextLevelXp || (level * 150);
  const xpToNextLevel = stats?.xpToNextLevel ?? Math.max(0, nextLevelXp - xp);
  const levelRange = Math.max(1, nextLevelXp - currentLevelXp);
  const pct = xpToNextLevel > 0
    ? Math.min(Math.max(((xp - currentLevelXp) / levelRange) * 100, 0), 100)
    : 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] sm:text-xs text-[#849495] mb-1.5">
        <span>{xp} XP</span><span>{xpToNextLevel} XP to Lv.{level + 1}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: 'var(--theme-accent)', boxShadow: '0 0 8px var(--theme-accent)' }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const authUser = useSelector(s => s.auth.user);
  const { stats, badges, xpLog, fetchStats } = useUserStats();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero profile card */}
      <div className="glass-glow rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
               style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid rgba(0,245,255,0.3)', color: 'var(--theme-accent)', boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
            {(authUser?.fullname || 'U')[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{authUser?.fullname}</h1>
              {stats && (
                <span className="pill-accent text-[10px] sm:text-xs px-3 py-1">Level {stats.level}</span>
              )}
            </div>
            <p className="text-[#849495] text-sm mb-5">{authUser?.email}</p>

            {stats && <XPBar stats={stats} />}

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {[
                { icon: Flame,  label: 'Streak',   value: `${stats?.currentStreak || 0}d`, color: 'text-orange-400' },
                { icon: Zap,    label: 'Total XP',  value: `${stats?.xp || 0}`, color: 'text-accent' },
                { icon: Target, label: 'Sessions',  value: stats?.totalSessionsCompleted || 0, color: 'text-white' },
                { icon: Clock,  label: 'Focus Hrs', value: `${Math.round((stats?.totalFocusMinutes || 0) / 60)}h`, color: 'text-white' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass p-3 rounded-2xl text-center">
                  <Icon size={14} className={`${color} mx-auto mb-1.5`} />
                  <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-[#849495] uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award size={16} className="text-accent" />
          <span className="label-eyebrow">BADGES & ACHIEVEMENTS</span>
        </div>
        {badges.length === 0 ? (
          <p className="text-[#849495] text-sm py-4 text-center">Complete focus sessions to earn badges!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {badges.map((b, i) => <Badge key={i} badge={b} />)}
          </div>
        )}
      </div>

      {/* XP Log */}
      {xpLog.length > 0 && (
        <div className="glass rounded-2xl p-5 sm:p-6">
          <p className="label-eyebrow mb-5">RECENT XP ACTIVITY</p>
          <div className="space-y-1">
            {xpLog.slice(0, 8).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#dce4e4]">{entry.reason || entry.source || 'Activity reward'}</span>
                  <span className="text-[10px] text-[#849495] sm:hidden">{formatDate(entry.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-accent font-bold text-sm">+{entry.xp} XP</span>
                  <span className="text-[10px] text-[#849495] hidden sm:block w-24 text-right">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
