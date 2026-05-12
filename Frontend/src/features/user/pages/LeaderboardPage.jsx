import React, { useEffect } from 'react';
import { Trophy, Crown, Zap, Flame, Medal, Award } from 'lucide-react';
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
  const { stats }                           = useUserStats();
  const authUser                            = useSelector(s => s.auth.user);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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
        <div className="glass-glow rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="text-5xl font-bold text-accent tabular-nums">#{myRank}</div>
          <div className="hidden sm:block h-12 w-px bg-white/8" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div>
              <p className="label-eyebrow mb-1">YOUR XP</p>
              <p className="text-xl font-bold text-accent">{myEntry.xp?.toLocaleString()}</p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">LEVEL</p>
              <p className="text-xl font-bold text-white">Lv.{myEntry.level}</p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">STREAK</p>
              <p className="text-xl font-bold text-orange-400 flex items-center gap-1">
                <Flame size={14} />{myEntry.streak}d
              </p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">BADGES</p>
              <p className="text-xl font-bold text-amber-400 flex items-center gap-1">
                <Award size={14} />{myEntry.badges}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {list.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 2nd place */}
          <div className="glass rounded-2xl p-5 text-center flex flex-col items-center gap-2 mt-0 sm:mt-6 order-2 sm:order-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                 style={{ background: 'rgba(148,163,184,0.15)', border: '2px solid rgba(148,163,184,0.3)', color: '#cbd5e1' }}>
              {(list[1]?.fullname || '?')[0].toUpperCase()}
            </div>
            <Medal size={20} className="text-slate-300" />
            <p className="text-white font-semibold text-sm truncate w-full text-center">{list[1]?.fullname}</p>
            <span className="pill text-xs">Lv.{list[1]?.level}</span>
            <p className="text-accent font-bold">{list[1]?.xp?.toLocaleString()} XP</p>
          </div>

          {/* 1st place */}
          <div className="glass-glow rounded-2xl p-5 text-center flex flex-col items-center gap-2 relative order-1 sm:order-2"
               style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold"
                 style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
              CHAMPION
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                 style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.5)', color: '#fbbf24',
                          boxShadow: '0 0 16px rgba(251,191,36,0.2)' }}>
              {(list[0]?.fullname || '?')[0].toUpperCase()}
            </div>
            <Crown size={22} className="text-amber-400" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }} />
            <p className="text-white font-bold truncate w-full text-center">{list[0]?.fullname}</p>
            <span className="pill-accent text-xs">Lv.{list[0]?.level}</span>
            <p className="text-accent font-bold text-lg">{list[0]?.xp?.toLocaleString()} XP</p>
          </div>

          {/* 3rd place */}
          <div className="glass rounded-2xl p-5 text-center flex flex-col items-center gap-2 mt-0 sm:mt-6 order-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                 style={{ background: 'rgba(180,120,60,0.15)', border: '2px solid rgba(180,120,60,0.3)', color: '#d97706' }}>
              {(list[2]?.fullname || '?')[0].toUpperCase()}
            </div>
            <Medal size={20} className="text-amber-600" />
            <p className="text-white font-semibold text-sm truncate w-full text-center">{list[2]?.fullname}</p>
            <span className="pill text-xs">Lv.{list[2]?.level}</span>
            <p className="text-accent font-bold">{list[2]?.xp?.toLocaleString()} XP</p>
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="glass rounded-2xl overflow-hidden overflow-x-auto scrollbar-hide">
        <div className="min-w-[600px]">
        {loading && list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#849495] text-sm">Loading leaderboard…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={32} className="text-[#849495] mx-auto mb-3" />
            <p className="text-[#849495] text-sm">No data yet. Complete focus sessions to appear here!</p>
          </div>
        ) : (
          <>
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
          </>
        )}
        </div>
      </div>
    </div>
  );
}
