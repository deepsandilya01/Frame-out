import React, { useEffect } from 'react';
import { Trophy, Crown, Flame, Medal, Award } from 'lucide-react';
import { useLeaderboard, useUserStats } from '../hook/useUserStats';
import { useSelector } from 'react-redux';

function RankBadge({ rank }) {
  if (rank === 1) return <Crown size={18} className="text-amber-400" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />;
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="text-[#849495] text-xs font-mono tabular-nums">#{rank}</span>;
}

function RankRowBg(rank) {
  if (rank === 1) return 'bg-amber-400/5 border-b border-amber-400/10';
  if (rank === 2) return 'bg-slate-300/3 border-b border-white/5';
  if (rank === 3) return 'bg-amber-700/4 border-b border-white/5';
  return 'border-b border-white/4 hover:bg-white/2';
}

export default function LeaderboardPage() {
  const { list, loading, fetchLeaderboard } = useLeaderboard();
  const authUser                            = useSelector(s => s.auth.user);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Find current user's rank by matching fullname (backend only returns fullname)
  const myRank = list.findIndex(
    e => e.fullname === authUser?.fullname
  ) + 1;

  const myEntry = myRank > 0 ? list[myRank - 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center"
             style={{ border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 16px rgba(0,245,255,0.1)' }}>
          <Trophy size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
          <p className="text-[#849495] text-sm">
            {list.length > 0 ? `Top ${list.length} performers` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Your rank highlight card */}
      {myEntry && (
        <div className="glass-glow rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="text-5xl sm:text-6xl font-black text-accent tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(0,245,255,0.2)]">
            #{myRank}
          </div>
          <div className="hidden sm:block h-16 w-px bg-white/10" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 w-full">
            <div className="text-center sm:text-left">
              <p className="label-eyebrow mb-1 opacity-70">YOUR XP</p>
              <p className="text-2xl font-bold text-accent">{myEntry.xp?.toLocaleString()}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="label-eyebrow mb-1 opacity-70">LEVEL</p>
              <p className="text-2xl font-bold text-white">Lv.{myEntry.level}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="label-eyebrow mb-1 opacity-70">STREAK</p>
              <p className="text-2xl font-bold text-orange-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Flame size={18} fill="currentColor" />{myEntry.streak}d
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="label-eyebrow mb-1 opacity-70">BADGES</p>
              <p className="text-2xl font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Award size={18} fill="currentColor" />{myEntry.badges}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {list.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* 2nd place */}
          <div className="glass rounded-2xl p-6 text-center flex flex-col items-center gap-3 order-2 md:order-1 hover-lift">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                 style={{ background: 'rgba(148,163,184,0.1)', border: '2px solid rgba(148,163,184,0.2)', color: '#cbd5e1' }}>
              {(list[1]?.fullname || '?')[0].toUpperCase()}
            </div>
            <div className="flex flex-col items-center">
              <Medal size={24} className="text-slate-300 mb-1" />
              <p className="text-white font-bold text-base truncate w-40">{list[1]?.fullname}</p>
              <span className="pill text-[10px] mt-1">Lv.{list[1]?.level}</span>
            </div>
            <p className="text-accent font-black text-xl">{list[1]?.xp?.toLocaleString()} <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest ml-1">XP</span></p>
          </div>

          {/* 1st place */}
          <div className="glass-glow rounded-3xl p-8 text-center flex flex-col items-center gap-4 relative order-1 md:order-2 scale-105 z-10 hover-lift"
               style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'linear-gradient(180deg, rgba(251,191,36,0.05) 0%, transparent 100%)' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-widest"
                 style={{ background: '#fbbf24', color: '#000', boxShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
              CHAMPION
            </div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black"
                 style={{ background: 'rgba(251,191,36,0.1)', border: '2px solid #fbbf24', color: '#fbbf24',
                          boxShadow: '0 0 30px rgba(251,191,36,0.2)' }}>
              {(list[0]?.fullname || '?')[0].toUpperCase()}
            </div>
            <div className="flex flex-col items-center">
              <Crown size={32} className="text-amber-400 mb-1" style={{ filter: 'drop-shadow(0 0 12px #f59e0b)' }} />
              <p className="text-white font-black text-lg truncate w-48">{list[0]?.fullname}</p>
              <span className="pill-accent text-[10px] mt-1 font-bold">LEVEL {list[0]?.level}</span>
            </div>
            <p className="text-accent font-black text-2xl">{list[0]?.xp?.toLocaleString()} <span className="text-xs font-medium opacity-50 uppercase tracking-widest ml-1">XP</span></p>
          </div>

          {/* 3rd place */}
          <div className="glass rounded-2xl p-6 text-center flex flex-col items-center gap-3 order-3 hover-lift">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                 style={{ background: 'rgba(180,120,60,0.1)', border: '2px solid rgba(180,120,60,0.2)', color: '#d97706' }}>
              {(list[2]?.fullname || '?')[0].toUpperCase()}
            </div>
            <div className="flex flex-col items-center">
              <Medal size={24} className="text-amber-600 mb-1" />
              <p className="text-white font-bold text-base truncate w-40">{list[2]?.fullname}</p>
              <span className="pill text-[10px] mt-1">Lv.{list[2]?.level}</span>
            </div>
            <p className="text-accent font-black text-xl">{list[2]?.xp?.toLocaleString()} <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest ml-1">XP</span></p>
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="glass rounded-3xl overflow-hidden shadow-2xl">
        {loading && list.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#849495] text-sm font-medium animate-pulse tracking-wide uppercase">Updating global rankings…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Trophy size={32} className="text-[#849495] opacity-50" />
            </div>
            <p className="text-white font-bold text-lg">No rankings yet</p>
            <p className="text-[#849495] text-sm mt-1">Complete focus sessions to claim your spot!</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[700px]">
              {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-white/8"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="label-eyebrow w-10 text-center">RANK</span>
              <span className="label-eyebrow flex-1">USER</span>
              <span className="label-eyebrow w-16 text-right">LEVEL</span>
              <span className="label-eyebrow w-24 text-right">XP</span>
              <span className="label-eyebrow w-20 text-right">STREAK</span>
              <span className="label-eyebrow w-16 text-right">BADGES</span>
            </div>

            {/* Data rows */}
            {list.map((entry, i) => {
              const rank = i + 1;
              const isMe = entry.fullname === authUser?.fullname;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${RankRowBg(rank)} ${isMe ? 'bg-accent-dim' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-10 flex items-center justify-center">
                    <RankBadge rank={rank} />
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                         style={{
                           background: isMe ? 'rgba(0,245,255,0.2)' : rank === 1 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                           border:     isMe ? '1px solid rgba(0,245,255,0.4)' : rank === 1 ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.1)',
                           color:      isMe ? 'var(--theme-accent)' : rank === 1 ? '#fbbf24' : '#dce4e4',
                           boxShadow:  rank <= 3 ? `0 0 8px ${rank === 1 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)'}` : 'none',
                         }}>
                      {(entry.fullname || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-accent' : 'text-[#dce4e4]'}`}>
                        {entry.fullname}
                        {isMe && (
                          <span className="ml-2 text-[9px] bg-accent-dim text-accent border border-accent/20 rounded-full px-1.5 py-0.5">you</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="w-16 text-right">
                    <span className={`pill text-xs ${rank === 1 ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' : ''}`}>
                      Lv.{entry.level}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="w-24 text-right">
                    <span className="text-accent font-bold text-sm tabular-nums">
                      {entry.xp?.toLocaleString()}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="w-20 text-right">
                    <span className="text-orange-400 text-sm flex items-center justify-end gap-1 tabular-nums">
                      <Flame size={11} />{entry.streak}d
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="w-16 text-right">
                    <span className="text-amber-400 text-sm flex items-center justify-end gap-1">
                      <Award size={11} />{entry.badges}
                    </span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
