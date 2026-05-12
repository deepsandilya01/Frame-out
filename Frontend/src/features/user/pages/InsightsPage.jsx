import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, Clock, Zap, Target, History as HistoryIcon, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
  Monitor, Brain, ShieldAlert, BarChart2
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

const PIE_COLORS = {
  Productive: '#00F5FF',
  Distracting: '#ef4444',
  Neutral: '#849495'
};

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

function formatTime(secs) {
  if (!secs) return '0m';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatBlock({ label, value, unit, sub, icon: Icon, accentColor }) {
  return (
    <div className="glass rounded-xl p-4 flex items-start justify-between group hover:border-white/10 transition-all">
      <div>
        <p className="label-eyebrow mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">
          {value}<span className="text-sm text-[#849495] ml-1">{unit}</span>
        </p>
        {sub && <p className="text-[10px] text-[#849495] mt-1">{sub}</p>}
      </div>
      {Icon && <Icon size={16} className="transition-colors" style={{ color: accentColor || '#849495' }} />}
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

  const [activityStats, setActivityStats] = useState(null);
  const [actLoading, setActLoading] = useState(true);

  // Load Data
  useEffect(() => {
    fetchAll();
    fetchYear();
    loadHistory(1);
    loadActivityStats();
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

  const loadActivityStats = async () => {
    setActLoading(true);
    try {
      const res = await userService.getActivityStats();
      setActivityStats(res.data);
    } catch (e) { console.error("Failed to load activity stats", e); }
    finally { setActLoading(false); }
  };

  const { overview, week } = analytics;
  const todayAct = activityStats?.today || {};

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
  const weekData = week?.snapshots
    ? week.snapshots.map((s, i) => {
        const d = new Date(s.date);
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          minutes: s.totalFocusMinutes || 0,
          distractions: s.distractionsCount || 0,
        };
      })
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], minutes: 0, distractions: 0 }));

  // Pie chart data
  const pieData = [
    { name: 'Productive', value: todayAct.productiveTime || 1, color: PIE_COLORS.Productive },
    { name: 'Distracting', value: todayAct.distractingTime || 0, color: PIE_COLORS.Distracting },
    { name: 'Neutral', value: todayAct.neutralTime || 0, color: PIE_COLORS.Neutral },
  ].filter(d => d.value > 0);

  // Top websites
  const topSites = [...(todayAct.websites || [])].sort((a,b) => b.duration - a.duration).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Intelligence Dashboard</h1>
        <p className="text-[#849495] text-sm mt-0.5">Smart Screen Time & Activity Analytics</p>
      </div>

      {/* 1. Core Metrics (Updated for Activity) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBlock 
          label="TOTAL SCREEN TIME" 
          value={formatTime(todayAct.totalScreenTime).split(' ')[0]} 
          unit={formatTime(todayAct.totalScreenTime).split(' ')[1] || ''} 
          sub="Today's usage"
          icon={Monitor}
        />
        <StatBlock 
          label="PRODUCTIVE TIME" 
          value={formatTime(todayAct.productiveTime).split(' ')[0]} 
          unit={formatTime(todayAct.productiveTime).split(' ')[1] || ''} 
          sub="Deep work & tools"
          icon={Activity}
          accentColor={PIE_COLORS.Productive}
        />
        <StatBlock 
          label="DISTRACTING TIME" 
          value={formatTime(todayAct.distractingTime).split(' ')[0]} 
          unit={formatTime(todayAct.distractingTime).split(' ')[1] || ''} 
          sub="Social media & leisure"
          icon={ShieldAlert}
          accentColor={PIE_COLORS.Distracting}
        />
        <StatBlock 
          label="TOTAL FOCUS" 
          value={Math.round((overview?.totalFocusMinutes || 0) / 60)} 
          unit="hrs" 
          sub="All time focus"
          icon={Target}
        />
      </div>

      {/* 2. AI Smart Insight Banner */}
      {todayAct.distractingTime > 3600 && (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={16} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-1">Distraction Alert 🚀</h3>
            <p className="text-[#849495] text-xs">You've spent over an hour on distracting websites today. Consider starting a 25-minute recovery sprint to regain your focus.</p>
          </div>
        </div>
      )}
      
      {todayAct.productiveTime > 7200 && (
        <div className="glass rounded-xl p-4 border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)]/20 flex items-center justify-center flex-shrink-0">
            <Brain size={16} className="text-[var(--theme-accent)]" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-1">Peak Productivity 🧠</h3>
            <p className="text-[#849495] text-xs">You're in the zone! With over 2 hours of productive activity, you are operating at peak efficiency today. Keep the momentum going!</p>
          </div>
        </div>
      )}

      {/* 3. Screen Time Breakdown & Top Websites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Pie Chart */}
        <div className="glass rounded-2xl p-5 border border-white/5 lg:col-span-1 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
             <p className="label-eyebrow">ACTIVITY BREAKDOWN</p>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center relative">
            {actLoading ? (
               <div className="animate-pulse text-[#849495] text-xs">Analyzing...</div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
               </ResponsiveContainer>
            )}
            {!actLoading && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white font-bold text-xl">{formatTime(todayAct.totalScreenTime)}</span>
            </div>}
          </div>
          <div className="flex gap-4 mt-2 w-full justify-center">
             {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                   <span className="text-[10px] text-[#849495]">{d.name}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Top Websites */}
        <div className="glass rounded-2xl p-5 border border-white/5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
             <p className="label-eyebrow">TOP WEBSITES TODAY</p>
             <BarChart2 size={16} className="text-[#849495]" />
          </div>
          {actLoading ? (
             <div className="space-y-3">
               {[1,2,3,4].map(i => <div key={i} className="h-8 glass rounded animate-pulse" />)}
             </div>
          ) : topSites.length === 0 ? (
             <div className="h-full flex items-center justify-center pb-8 text-[#849495] text-xs">
                No website activity tracked yet. Use the Chrome Extension to start tracking.
             </div>
          ) : (
             <div className="space-y-3">
               {topSites.map((site, i) => {
                 const pct = (site.duration / todayAct.totalScreenTime) * 100;
                 return (
                   <div key={i} className="flex items-center gap-4">
                      <div className="w-8 text-center text-[#849495] font-mono text-xs">{(i+1).toString().padStart(2, '0')}</div>
                      <div className="flex-1">
                         <div className="flex justify-between mb-1">
                            <span className="text-white text-sm font-medium">{site.website}</span>
                            <span className="text-[#849495] text-xs">{formatTime(site.duration)}</span>
                         </div>
                         <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" 
                                 style={{ 
                                   width: `${pct}%`, 
                                   background: PIE_COLORS[site.category] || PIE_COLORS.Neutral 
                                 }} 
                            />
                         </div>
                      </div>
                      <div className="w-20 text-right">
                         <span className="pill text-[9px] px-2" style={{ color: PIE_COLORS[site.category], borderColor: `${PIE_COLORS[site.category]}40` }}>
                            {site.category}
                         </span>
                      </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>

      {/* 4. Heatmap Section */}
      <div className="glass rounded-2xl p-6 border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[var(--theme-accent)]" />
            <h2 className="text-white font-semibold text-sm">Productivity Heatmap</h2>
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
              <div className="flex gap-1.5 ml-8 mb-1">
                {weeks.map((week, i) => {
                  const firstDay = week.find(d => d && d.date);
                  if (!firstDay) return <div key={i} className="w-3 h-3" />;
                  const dateObj = new Date(firstDay.date);
                  const monthStr = dateObj.toLocaleString('en-US', { month: 'short' });
                  
                  let showLabel = false;
                  if (i === 0) {
                    showLabel = true;
                  } else {
                    const prevWeekFirstDay = weeks[i - 1].find(d => d && d.date);
                    if (prevWeekFirstDay) {
                      const prevMonthStr = new Date(prevWeekFirstDay.date).toLocaleString('en-US', { month: 'short' });
                      if (monthStr !== prevMonthStr) showLabel = true;
                    }
                  }

                  return (
                    <div key={i} className="w-3 relative">
                      {showLabel && <span className="absolute text-[9px] text-[#849495] top-0 -left-1 z-10">{monthStr}</span>}
                    </div>
                  );
                })}
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

      {/* 5. Trends Section */}
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

    </div>
  );
}
