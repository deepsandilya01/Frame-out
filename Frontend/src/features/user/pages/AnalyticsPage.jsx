import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { useAnalytics } from '../hook/useAnalytics';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <p className="text-[#849495] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function StatBlock({ label, value, unit, sub }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="label-eyebrow mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}<span className="text-sm text-[#849495] ml-1">{unit}</span></p>
      {sub && <p className="text-xs text-[#849495] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { analytics, fetchAll } = useAnalytics();

  useEffect(() => { fetchAll(); }, []);

  const { today, week, month, overview, loading } = analytics;

  // Build week chart data from week analytics sessions
  const weekData = week?.sessions
    ? week.sessions.map((s, i) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] || `D${i}`,
        minutes: s.duration || 0,
        distractions: s.distractions || 0,
      }))
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], minutes: 0, distractions: 0 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-[#849495] text-sm mt-0.5">Your productivity performance breakdown</p>
      </div>

      {/* Overview blocks */}
      <div className="grid grid-cols-4 gap-4">
        <StatBlock label="TOTAL FOCUS TIME" value={Math.round((overview?.totalFocusMinutes || 0) / 60)} unit="hrs" sub={`${overview?.totalFocusMinutes || 0} minutes`} />
        <StatBlock label="SESSIONS DONE" value={overview?.totalSessions || 0} unit="" />
        <StatBlock label="AVG SESSION" value={Math.round(overview?.avgSessionMinutes || 0)} unit="min" />
        <StatBlock label="PRODUCTIVITY RATE" value={`${Math.round((overview?.productivityRate || 0) * 100)}%`} unit="" sub="vs last week" />
      </div>

      {/* Today card */}
      {today && (
        <div className="glass rounded-2xl p-5 grid grid-cols-3 gap-4">
          <div>
            <p className="label-eyebrow mb-1">TODAY'S FOCUS</p>
            <p className="text-3xl font-bold text-white">{today.totalMinutes || 0}<span className="text-sm text-[#849495] ml-1">min</span></p>
          </div>
          <div>
            <p className="label-eyebrow mb-1">SESSIONS</p>
            <p className="text-3xl font-bold text-white">{today.sessions || 0}</p>
          </div>
          <div>
            <p className="label-eyebrow mb-1">DISTRACTIONS</p>
            <p className="text-3xl font-bold text-white">{today.distractions || 0}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Focus Minutes */}
        <div className="glass rounded-2xl p-5">
          <p className="label-eyebrow mb-4">WEEKLY FOCUS MINUTES</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill="var(--theme-accent)" opacity={0.8} radius={[4,4,0,0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distractions */}
        <div className="glass rounded-2xl p-5">
          <p className="label-eyebrow mb-4">DISTRACTIONS THIS WEEK</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="distractions" stroke="#ef4444" fill="url(#distGrad)" strokeWidth={2} name="Distractions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary */}
      {month && (
        <div className="glass rounded-2xl p-5">
          <p className="label-eyebrow mb-4">THIS MONTH</p>
          <div className="grid grid-cols-4 gap-4">
            <div><p className="text-[#849495] text-xs mb-1">Total Focus</p><p className="text-white font-bold text-xl">{Math.round((month.totalMinutes || 0) / 60)}h</p></div>
            <div><p className="text-[#849495] text-xs mb-1">Sessions</p><p className="text-white font-bold text-xl">{month.totalSessions || 0}</p></div>
            <div><p className="text-[#849495] text-xs mb-1">Best Day</p><p className="text-accent font-bold text-xl">{Math.round((month.bestDayMinutes || 0))}m</p></div>
            <div><p className="text-[#849495] text-xs mb-1">Avg/Day</p><p className="text-white font-bold text-xl">{Math.round((month.avgDailyMinutes || 0))}m</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
