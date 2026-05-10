import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, Clock, Zap, Target, History as HistoryIcon, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle 
} from 'lucide-react';
import { useAnalytics } from '../hook/useAnalytics';
import { useHeatmap } from '../hook/useHeatmap';
import { userService } from '../service/user.service';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// GitHub Contribution Shades
const GITHUB_COLORS = [
  'rgba(255,255,255,0.05)', // Lvl 0
  '#0e4429',               // Lvl 1
  '#006d32',               // Lvl 2
  '#26a641',               // Lvl 3
  '#39d353',               // Lvl 4
];
const ACTIVE_ONLY_COLOR = 'rgba(255,255,255,0.15)'; 


const MOOD_META = {
  sleepy:     { emoji: '😴', color: '#6366f1' },
  calm:       { emoji: '😐', color: '#64748b' },
  happy:      { emoji: '😊', color: '#f59e0b' },
  motivated:  { emoji: '🔥', color: '#f97316' },
  energized:  { emoji: '⚡', color: '#00F5FF' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-[#849495] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function StatBlock({ label, value, unit, sub, icon: Icon }) {
  return (
    <div className="glass rounded-xl p-4 flex items-start justify-between group hover:border-white/10 transition-all">
      <div>
        <p className="label-eyebrow mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">
          {value}<span className="text-sm text-[#849495] ml-1">{unit}</span>
        </p>
        {sub && <p className="text-[10px] text-[#849495] mt-1">{sub}</p>}
      </div>
      {Icon && <Icon size={16} className="text-[#849495] group-hover:text-accent transition-colors" />}
    </div>
  );
}

export default function InsightsPage() {
  const { analytics, fetchAll } = useAnalytics();
  const { year, loading: heatLoading, fetchYear } = useHeatmap();
  
  const [sessions, setSessions] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAll();
    fetchYear();
    loadHistory(1);
  }, []);

  const loadHistory = async (p = 1) => {
    setHistLoading(true);
    try {
      const res = await userService.getFocusHistoryFull({ page: p, limit: 5 });
      setSessions(res.sessions || res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setPage(p);
    } catch (e) { console.error(e); }
    finally { setHistLoading(false); }
  };

  const { overview, week } = analytics;

  // Heatmap grouping - Ensure exactly 371 days (53 weeks) for a consistent grid
  const fullYear = [...(year || [])];
  const totalDaysNeeded = 53 * 7;
  while (fullYear.length < totalDaysNeeded) {
    fullYear.unshift({ intensity: 0, focusMinutes: 0 }); // Pad with empty days at the start
  }

  const weeks = [];
  for (let i = 0; i < fullYear.length; i += 7) {
    weeks.push(fullYear.slice(i, i + 7));
  }

  // Week chart data
  const weekData = week?.sessions
    ? week.sessions.map((s, i) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] || `D${i}`,
        minutes: s.duration || 0,
        distractions: s.distractions || 0,
      }))
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], minutes: 0, distractions: 0 }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Productivity Pulse</h1>
        <p className="text-[#849495] text-sm mt-0.5">Comprehensive insights and effort visualization</p>
      </div>

      {/* 1. Heatmap Section */}
      <div className="glass rounded-2xl p-6 border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <h2 className="text-white font-semibold text-sm">Consistency Map</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#849495]">Less</span>
            {GITHUB_COLORS.map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-[#849495]">More</span>
          </div>
        </div>

        {heatLoading ? (
          <div className="flex items-center justify-center h-24 animate-pulse text-[#849495] text-xs">Analyzing activity history...</div>
        ) : (
          <div className="overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            <div className="inline-flex flex-col gap-2 min-w-max">
              {/* Month markers */}
              <div className="flex gap-[2px] ml-8">
                {MONTHS.map(m => (
                  <span key={m} className="text-[9px] text-[#849495] w-[45px]">{m}</span>
                ))}
              </div>
              
              <div className="flex gap-1.5">
                {/* Day labels */}
                <div className="flex flex-col gap-1.5 mr-1 pt-1">
                  {['Mon','','Wed','','Fri','','Sun'].map((d, i) => (
                    <span key={i} className="text-[9px] text-[#849495] h-3 leading-3">{d}</span>
                  ))}
                </div>
                {/* Grid */}
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1.5">
                    {week.map((day, di) => {
                      const level = day?.level || 0;
                      const active = day?.wasActive || false;
                      let bg = GITHUB_COLORS[Math.min(level, 4)];
                      if (level === 0 && active) bg = ACTIVE_ONLY_COLOR;

                      return (
                        <div
                          key={di}
                          title={day?.date ? `${day.date}: ${day.focusMinutes || 0} min${active ? ' (Active)' : ''}` : 'No data'}
                          className="w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer"
                          style={{ background: bg }}
                        />
                      );
                    })}
                    {week.length < 7 && [...Array(7 - week.length)].map((_, i) => (
                      <div key={`pad-${i}`} className="w-3 h-3" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBlock 
          label="TOTAL FOCUS" 
          value={Math.round((overview?.totalFocusMinutes || 0) / 60)} 
          unit="hrs" 
          sub={`${overview?.totalFocusMinutes || 0}m total`}
          icon={Clock}
        />
        <StatBlock 
          label="SESSIONS" 
          value={overview?.totalSessions || 0} 
          unit="" 
          sub="All time"
          icon={Target}
        />
        <StatBlock 
          label="AVG SESSION" 
          value={Math.round(overview?.avgSessionMinutes || 0)} 
          unit="min" 
          sub="Per session"
          icon={Zap}
        />
        <StatBlock 
          label="EFFICIENCY" 
          value={`${Math.round((overview?.productivityRate || 0) * 100)}%`} 
          unit="" 
          sub="Last 7 days"
          icon={Activity}
        />
      </div>

      {/* 3. Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/5">
          <p className="label-eyebrow mb-6">WEEKLY FOCUS VOLUME</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="minutes" fill="var(--theme-accent)" opacity={0.8} radius={[4,4,0,0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/5">
          <p className="label-eyebrow mb-6">DISTRACTION TRENDS</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="distractions" stroke="#ef4444" fill="url(#distGrad)" strokeWidth={2} name="Distractions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/50">
            <HistoryIcon size={14} />
            <h3 className="text-xs font-semibold uppercase tracking-widest">Recent Activity</h3>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => loadHistory(page - 1)} disabled={page <= 1} className="p-1 hover:text-white text-[#849495] disabled:opacity-20"><ChevronLeft size={16}/></button>
              <span className="text-[10px] text-[#849495] font-mono">{page} / {totalPages}</span>
              <button onClick={() => loadHistory(page + 1)} disabled={page >= totalPages} className="p-1 hover:text-white text-[#849495] disabled:opacity-20"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>

        {histLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-[#849495] text-xs">No recent sessions found.</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s, i) => {
              const mood = MOOD_META[s.mood];
              const date = new Date(s.startedAt || s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return (
                <div key={s._id || i} className="glass rounded-xl px-4 py-3 flex items-center gap-4 hover:bg-white/4 transition-all group">
                  <div className="flex-shrink-0">
                    {s.completed ? <CheckCircle size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{s.notes || 'Focus Session'}</p>
                    <p className="text-[#849495] text-[10px] mt-0.5">{date} · <span className="capitalize">{s.timerType || 'Manual'}</span></p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                       <p className="text-white font-mono text-sm">{s.duration}m</p>
                       <p className="text-[#849495] text-[9px]">Duration</p>
                    </div>
                    {mood && <span className="text-lg" title={s.mood}>{mood.emoji}</span>}
                    {s.xpEarned > 0 && (
                      <div className="bg-accent-dim px-2 py-1 rounded-lg border border-accent/20 text-accent text-[10px] font-bold flex items-center gap-1">
                        <Zap size={10} /> +{s.xpEarned}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
