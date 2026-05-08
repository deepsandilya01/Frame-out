import React, { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { userService } from '../service/user.service';
import { Smile, TrendingUp, Zap } from 'lucide-react';

const MOOD_META = {
  sleepy:     { emoji: '😴', color: '#6366f1', label: 'Sleepy' },
  calm:       { emoji: '😐', color: '#64748b', label: 'Calm' },
  happy:      { emoji: '😊', color: '#f59e0b', label: 'Happy' },
  motivated:  { emoji: '🔥', color: '#f97316', label: 'Motivated' },
  energized:  { emoji: '⚡', color: '#00F5FF', label: 'Energized' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <p className="text-[#849495] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {p.value}{p.name?.includes('Focus') ? ' min' : ''}
        </p>
      ))}
    </div>
  );
};

export default function MoodAnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    userService.getMoodAnalytics()
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="glass rounded-2xl p-8 text-center text-red-400 text-sm">{error}</div>
  );

  const { distribution = [], trend = [], bestMood, totalTracked } = data || {};

  // Radar data (mood vs avg focus)
  const radarData = (distribution.length > 0 ? distribution : Object.keys(MOOD_META).map(m => ({ mood: m, avgFocus: 0, count: 0 })))
    .map(d => ({
      mood: MOOD_META[d.mood]?.label || d.mood,
      avgFocus: d.avgFocus,
      sessions: d.count,
    }));

  // Bar chart data sorted by mood order
  const barData = distribution.map(d => ({
    name: MOOD_META[d.mood]?.emoji + ' ' + (MOOD_META[d.mood]?.label || d.mood),
    sessions: d.count,
    avgFocus: d.avgFocus,
    color: MOOD_META[d.mood]?.color || '#849495',
  }));

  // Trend line data
  const trendData = trend.map(t => ({
    date: t.date.slice(5), // MM-DD
    focus: t.totalFocus,
    sessions: t.sessionCount,
    mood: MOOD_META[t.dominantMood]?.emoji || '?',
  }));

  const bestMoodMeta = MOOD_META[bestMood];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center"
             style={{ border: '1px solid rgba(0,245,255,0.3)' }}>
          <Smile size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mood Analytics</h1>
          <p className="text-[#849495] text-sm mt-0.5">How your emotions impact your productivity</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-glow rounded-2xl p-5">
          <p className="label-eyebrow mb-1">TOTAL TRACKED</p>
          <p className="text-3xl font-bold text-white">{totalTracked}</p>
          <p className="text-[#849495] text-xs">mood-tracked sessions</p>
        </div>
        <div className="glass-glow rounded-2xl p-5">
          <p className="label-eyebrow mb-1">TOP MOOD</p>
          {distribution[0] ? (
            <>
              <p className="text-3xl font-bold text-white">
                {MOOD_META[distribution[0].mood]?.emoji} {MOOD_META[distribution[0].mood]?.label}
              </p>
              <p className="text-[#849495] text-xs">{distribution[0].count} sessions</p>
            </>
          ) : <p className="text-[#849495]">No data yet</p>}
        </div>
        <div className="glass-glow rounded-2xl p-5"
             style={bestMoodMeta ? { borderColor: bestMoodMeta.color + '30' } : {}}>
          <p className="label-eyebrow mb-1">BEST FOR FOCUS</p>
          {bestMoodMeta ? (
            <>
              <p className="text-3xl font-bold" style={{ color: bestMoodMeta.color }}>
                {bestMoodMeta.emoji} {bestMoodMeta.label}
              </p>
              <p className="text-[#849495] text-xs">
                {distribution.find(d => d.mood === bestMood)?.avgFocus || 0} min avg
              </p>
            </>
          ) : <p className="text-[#849495]">No data yet</p>}
        </div>
      </div>

      {totalTracked === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">😊</div>
          <p className="text-white font-semibold mb-1">No mood data yet</p>
          <p className="text-[#849495] text-sm">Select your mood before starting a focus session to track this.</p>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mood distribution bar chart */}
            <div className="glass rounded-2xl p-5">
              <p className="label-eyebrow mb-4">SESSIONS PER MOOD</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical" barSize={16}>
                  <XAxis type="number" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#dce4e4', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" radius={[0, 4, 4, 0]} name="Sessions">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg focus per mood */}
            <div className="glass rounded-2xl p-5">
              <p className="label-eyebrow mb-4">AVG FOCUS MINUTES PER MOOD</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical" barSize={16}>
                  <XAxis type="number" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#dce4e4', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgFocus" radius={[0, 4, 4, 0]} name="Avg Focus">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood trend */}
          {trendData.length > 1 && (
            <div className="glass rounded-2xl p-5">
              <p className="label-eyebrow mb-1">FOCUS TREND (14 DAYS)</p>
              <p className="text-[#849495] text-xs mb-4">Total focus minutes per day with mood indicator</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const d = trendData.find(t => t.date === label);
                      return (
                        <div className="glass-strong rounded-xl px-3 py-2 text-xs">
                          <p className="text-[#849495]">{label}</p>
                          <p className="text-accent font-bold">{payload[0]?.value} min</p>
                          <p className="text-white">Mood: {d?.mood}</p>
                        </div>
                      );
                    }}
                  />
                  <Line dataKey="focus" stroke="var(--theme-accent)" strokeWidth={2}
                        dot={{ fill: 'var(--theme-accent)', r: 3 }}
                        activeDot={{ r: 5, fill: 'var(--theme-accent)' }}
                        name="Focus min" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mood distribution pills */}
          <div className="glass rounded-2xl p-5">
            <p className="label-eyebrow mb-4">MOOD BREAKDOWN</p>
            <div className="flex flex-wrap gap-3">
              {distribution.map((d, i) => {
                const meta = MOOD_META[d.mood] || {};
                const total = distribution.reduce((a, b) => a + b.count, 0);
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                return (
                  <div key={i} className="glass rounded-xl p-3 flex items-center gap-3 flex-1 min-w-36">
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{meta.label}</p>
                      <p className="text-xs" style={{ color: meta.color }}>{pct}% · {d.count} sessions</p>
                      <p className="text-[#849495] text-xs">{d.avgFocus} min avg</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
