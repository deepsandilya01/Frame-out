import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Target, RefreshCw, CheckCircle2, Circle, Zap, Loader2 } from 'lucide-react';
import { userService } from '../service/user.service';
import { setUserStats } from '../state/user.store';
import { gsap } from 'gsap';

const DIFF_META = {
  easy:   { color: '#10b981', label: 'EASY',   bg: 'rgba(16,185,129,0.08)'  },
  medium: { color: '#f59e0b', label: 'MEDIUM',  bg: 'rgba(245,158,11,0.08)' },
  hard:   { color: '#ef4444', label: 'HARD',    bg: 'rgba(239,68,68,0.08)'  },
};

const CAT_EMOJI = {
  focus: '⏱', tasks: '✅', wellness: '🧘', streak: '🔥', reflection: '📝',
};

export default function DailyMissions({ onXPEarned }) {
  const dispatch = useDispatch();
  const [missions,  setMissions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [regen,     setRegen]     = useState(false);
  const [completing,setCompleting]= useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getTodayMissions();
      setMissions(res.missions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const complete = async (mission) => {
    if (mission.completed || completing) return;
    setCompleting(mission._id);
    try {
      const res = await userService.completeMission(mission._id);
      setMissions(res.missions || []);
      if (res.stats) dispatch(setUserStats(res.stats));
      if (onXPEarned) onXPEarned(res.xpEarned || 0);

      // Small bounce animation on the card
      const el = document.getElementById(`mission-${mission._id}`);
      if (el) gsap.fromTo(el, { scale: 1 }, { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    } catch (e) { console.error(e); }
    finally { setCompleting(null); }
  };

  const regenerate = async () => {
    setRegen(true);
    try {
      const res = await userService.regenerateMissions();
      setMissions(res.missions || []);
    } catch (e) { console.error(e); }
    finally { setRegen(false); }
  };

  const completedCount = missions.filter(m => m.completed).length;
  const totalXP        = missions.reduce((a, m) => a + (m.xpReward || 0), 0);
  const earnedXP       = missions.filter(m => m.completed).reduce((a, m) => a + (m.xpReward || 0), 0);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          <Target size={14} className="text-accent" />
          <span className="text-white text-sm font-semibold">Daily Missions</span>
          {!loading && missions.length > 0 && (
            <span className="pill-accent text-[10px] px-2 py-0.5 ml-1">
              {completedCount}/{missions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && earnedXP > 0 && (
            <span className="text-accent text-xs font-bold">+{earnedXP} XP earned</span>
          )}
          <button onClick={regenerate} disabled={regen || loading}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all">
            <RefreshCw size={11} className={`text-[#849495] ${regen ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-3 py-6 justify-center">
            <Loader2 size={16} className="text-accent animate-spin" />
            <span className="text-[#849495] text-sm">AI generating missions…</span>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[#849495] text-sm">No missions yet.</p>
            <button onClick={load} className="btn-primary mt-3 px-4 py-2 text-xs">Generate Missions</button>
          </div>
        ) : (
          missions.map((m, i) => {
            const diff = DIFF_META[m.difficulty] || DIFF_META.easy;
            const isCompleting = completing === m._id;
            return (
              <div
                key={m._id || i}
                id={`mission-${m._id}`}
                onClick={() => complete(m)}
                className={`rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  m.completed ? 'opacity-50' : 'hover:bg-white/4'
                }`}
                style={{ background: m.completed ? 'rgba(255,255,255,0.02)' : diff.bg, border: `1px solid ${diff.color}20` }}
              >
                {/* Check icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleting ? (
                    <Loader2 size={18} className="text-accent animate-spin" />
                  ) : m.completed ? (
                    <CheckCircle2 size={18} style={{ color: diff.color }} />
                  ) : (
                    <Circle size={18} className="text-[#849495]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: m.completed ? '#849495' : '#dce4e4',
                      textDecoration: m.completed ? 'line-through' : 'none' }}>
                      {CAT_EMOJI[m.category] || '🎯'} {m.title}
                    </span>
                  </div>
                  {m.description && (
                    <p className="text-[#849495] text-xs leading-relaxed">{m.description}</p>
                  )}
                </div>

                {/* XP + difficulty */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Zap size={10} style={{ color: diff.color }} />
                    <span className="text-xs font-bold" style={{ color: diff.color }}>+{m.xpReward}</span>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: diff.color }}>
                    {diff.label}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* XP progress bar */}
        {!loading && missions.length > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-[10px] text-[#849495] mb-1">
              <span>Mission XP</span><span>{earnedXP}/{totalXP} XP</span>
            </div>
            <div className="h-1 rounded-full bg-white/5">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${totalXP > 0 ? (earnedXP / totalXP) * 100 : 0}%`,
                     background: 'var(--theme-accent)',
                     boxShadow: '0 0 6px var(--theme-accent)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
