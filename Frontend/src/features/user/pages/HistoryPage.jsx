import React, { useEffect, useState } from 'react';
import { History, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Zap, Filter } from 'lucide-react';
import { userService } from '../service/user.service';

const MOOD_META = {
  sleepy:     { emoji: '😴', color: '#6366f1' },
  calm:       { emoji: '😐', color: '#64748b' },
  happy:      { emoji: '😊', color: '#f59e0b' },
  motivated:  { emoji: '🔥', color: '#f97316' },
  energized:  { emoji: '⚡', color: '#00F5FF' },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min) {
  if (!min) return '—';
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function HistoryPage() {
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);
  const [total,     setTotal]     = useState(0);
  const [filter,    setFilter]    = useState('all'); // 'all' | 'completed' | 'incomplete'

  const LIMIT = 10;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await userService.getFocusHistoryFull({ page: p, limit: LIMIT });
      setSessions(res.sessions || res.data || []);
      const pag = res.pagination || {};
      setTotal(pag.total || 0);
      setTotalPages(pag.pages || 1);
      setPage(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const filtered = filter === 'all' ? sessions
    : filter === 'completed' ? sessions.filter(s => s.completed)
    : sessions.filter(s => !s.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center"
               style={{ border: '1px solid rgba(0,245,255,0.3)' }}>
            <History size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Session History</h1>
            <p className="text-[#849495] text-sm">{total} sessions total</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 glass rounded-full p-1">
          {['all', 'completed', 'incomplete'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Sessions', value: total, color: 'text-white' },
            { label: 'Completed',      value: sessions.filter(s => s.completed).length, color: 'text-emerald-400' },
            { label: 'Focus Time',     value: formatDuration(sessions.reduce((a, s) => a + (s.duration || 0), 0)), color: 'text-accent' },
            { label: 'Avg Distractions', value: sessions.length > 0
                ? (sessions.reduce((a, s) => a + (s.distractions || 0), 0) / sessions.length).toFixed(1)
                : 0, color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[#849495] text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <History size={32} className="text-[#849495] mx-auto mb-3" />
          <p className="text-[#849495] text-sm">No sessions found. Start a focus session to build your history!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => {
            const mood = MOOD_META[s.mood];
            return (
              <div key={s._id || i} className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/2 transition-all">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {s.completed
                    ? <CheckCircle size={20} className="text-emerald-400" />
                    : <XCircle    size={20} className="text-[#849495]" />
                  }
                </div>

                {/* Date + type */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#dce4e4] text-sm font-medium">{formatDate(s.startedAt || s.createdAt)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      s.timerType === 'pomodoro'
                        ? 'bg-accent-dim text-accent border-accent/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-400/20'
                    }`}>
                      {s.timerType || 'custom'}
                    </span>
                  </div>
                  {s.notes && (
                    <p className="text-[#849495] text-xs truncate max-w-xs">{s.notes}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-sm text-[#849495]">
                  <Clock size={13} />
                  <span className="tabular-nums">{formatDuration(s.duration)}</span>
                </div>

                {/* Mood */}
                {mood && (
                  <div className="text-lg" title={s.mood}>{mood.emoji}</div>
                )}

                {/* Distractions */}
                <div className={`text-xs px-2 py-1 rounded-lg ${
                  (s.distractions || 0) === 0 ? 'text-emerald-400 bg-emerald-500/10' :
                  (s.distractions || 0) < 3   ? 'text-amber-400 bg-amber-500/10' :
                  'text-red-400 bg-red-500/10'
                }`}>
                  {s.distractions || 0} distract.
                </div>

                {/* XP */}
                {s.xpEarned > 0 && (
                  <div className="flex items-center gap-1 text-accent text-xs font-bold">
                    <Zap size={11} /> +{s.xpEarned}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => load(page - 1)} disabled={page <= 1 || loading}
            className="btn-ghost px-3 py-2 disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          <span className="text-[#849495] text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => load(page + 1)} disabled={page >= totalPages || loading}
            className="btn-ghost px-3 py-2 disabled:opacity-30">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
