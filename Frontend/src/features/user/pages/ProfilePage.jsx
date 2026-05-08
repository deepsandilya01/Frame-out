import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Zap, Flame, Award, Clock, Target } from 'lucide-react';
import { useUserStats } from '../hook/useUserStats';

const BADGE_ICONS = { default: '🏅', streak: '🔥', focus: '⚡', level: '⭐', master: '👑', zen: '🧘', night: '🌙', early: '🌅' };

function Badge({ badge }) {
  const icon = Object.keys(BADGE_ICONS).find(k => badge.badgeId?.includes(k)) || 'default';
  return (
    <div className={`glass rounded-xl p-3 text-center transition-all hover-lift ${badge.earned ? 'border-accent/20' : 'opacity-40'}`}
         style={badge.earned ? { border: '1px solid rgba(0,245,255,0.2)' } : {}}>
      <div className="text-2xl mb-1">{BADGE_ICONS[icon]}</div>
      <p className="text-xs font-medium text-[#dce4e4] leading-tight">{badge.name || badge.badgeId}</p>
      {badge.earned && badge.earnedAt && (
        <p className="text-[10px] text-[#849495] mt-0.5">
          {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
      {!badge.earned && <p className="text-[10px] text-[#849495] mt-0.5">Locked</p>}
    </div>
  );
}

function XPBar({ xp, level }) {
  const needed = level * 150;
  const pct = Math.min((xp / needed) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-[#849495] mb-1.5">
        <span>{xp} XP</span><span>{needed} XP to Lv.{level + 1}</span>
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
  const { stats, badges, xpLog, loading, fetchStats } = useUserStats();

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="space-y-6">
      {/* Hero profile card */}
      <div className="glass-glow rounded-3xl p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
               style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid rgba(0,245,255,0.3)', color: 'var(--theme-accent)', boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
            {(authUser?.fullname || 'U')[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{authUser?.fullname}</h1>
              {stats && (
                <span className="pill-accent text-xs px-3 py-1">Level {stats.level}</span>
              )}
            </div>
            <p className="text-[#849495] text-sm mb-4">{authUser?.email}</p>

            {stats && <XPBar xp={stats.xp} level={stats.level} />}

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4 mt-5">
              {[
                { icon: Flame,  label: 'Streak',   value: `${stats?.currentStreak || 0}d`, color: 'text-orange-400' },
                { icon: Zap,    label: 'Total XP',  value: `${stats?.xp || 0}`, color: 'text-accent' },
                { icon: Target, label: 'Sessions',  value: stats?.totalSessionsCompleted || 0, color: 'text-white' },
                { icon: Clock,  label: 'Focus Hrs', value: `${Math.round((stats?.totalFocusMinutes || 0) / 60)}h`, color: 'text-white' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center">
                  <Icon size={16} className={`${color} mx-auto mb-1`} />
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-[#849495]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-accent" />
          <span className="label-eyebrow">BADGES & ACHIEVEMENTS</span>
        </div>
        {badges.length === 0 ? (
          <p className="text-[#849495] text-sm">Complete focus sessions to earn badges!</p>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {badges.map((b, i) => <Badge key={i} badge={b} />)}
          </div>
        )}
      </div>

      {/* XP Log */}
      {xpLog.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="label-eyebrow mb-4">RECENT XP ACTIVITY</p>
          <div className="space-y-2">
            {xpLog.slice(0, 8).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                <span className="text-sm text-[#b9caca]">{entry.reason || entry.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-semibold text-sm">+{entry.xp} XP</span>
                  <span className="text-[10px] text-[#849495]">
                    {new Date(entry.createdAt).toLocaleDateString()}
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
