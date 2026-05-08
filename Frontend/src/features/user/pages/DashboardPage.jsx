import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { Flame, Zap, Clock, Target, ChevronRight, TrendingUp, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboard } from '../hook/useDashboard';
import DailyMissions from '../components/DailyMissions';

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f97316', low: '#4ade80' };
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function StatCard({ label, value, sub, icon: Icon, accent, children }) {
  return (
    <div className="stat-card glass-glow rounded-2xl p-5 relative overflow-hidden hover-lift cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="label-eyebrow mb-1">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {sub && <p className="text-xs text-[#849495] mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-dim border border-accent/20">
          <Icon size={16} className="text-accent" />
        </div>
      </div>
      {children}
    </div>
  );
}

function XPBar({ xp, nextLevel }) {
  const pct = nextLevel > 0 ? Math.min((xp / nextLevel) * 100, 100) : 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[#849495] mb-1">
        <span>{xp} XP</span><span>{nextLevel} XP</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: 'var(--theme-accent)', boxShadow: '0 0 6px var(--theme-accent)' }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const cardsRef = useRef(null);
  const { dashboard, loadDashboard, loadAIInsight } = useDashboard();
  const user    = useSelector(s => s.auth.user);
  const ai      = useSelector(s => s.user.dashboard.aiInsight);

  useEffect(() => {
    loadDashboard();
    loadAIInsight();
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll('.stat-card, .content-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, [dashboard.stats]);

  const stats    = dashboard.stats?.userStats;
  const focusStats = dashboard.stats?.focusStats;
  const tasks    = dashboard.recentTasks;
  const sessions = dashboard.weeklyFocus;

  // Build weekly bar data
  const weekData = DAY_LABELS.map((day, i) => ({
    day,
    minutes: sessions[i]?.duration || 0,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div ref={cardsRef} className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting()}, <span className="text-accent">{user?.fullname?.split(' ')[0] || 'there'}</span>
          </h1>
          {ai && (
            <span className="pill-accent text-[10px] px-3 py-1">
              <Brain size={9} className="inline mr-1" />AI Ready
            </span>
          )}
        </div>
        <p className="text-[#849495] text-sm">{today}</p>
      </div>

      {/* Stat Cards */}
      {dashboard.loading && !stats ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="PRODUCTIVITY" value={`${focusStats?.completedSessions || 0}`} sub="sessions completed" icon={Target}>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-2">
              <div className="h-full rounded-full bg-accent/60"
                   style={{ width: `${Math.min((focusStats?.completedSessions || 0) * 10, 100)}%` }} />
            </div>
          </StatCard>

          <StatCard label="FOCUS TODAY" icon={Clock}
            value={`${Math.round((focusStats?.todayMinutes || 0) / 60 * 10) / 10}h`}
            sub={`${focusStats?.todayMinutes || 0} minutes`}>
            <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
              <TrendingUp size={10} /> On track
            </div>
          </StatCard>

          <StatCard label="STREAK" icon={Flame}
            value={`${stats?.currentStreak || 0}`}
            sub={stats?.longestStreak > (stats?.currentStreak || 0)
              ? `Best: ${stats.longestStreak} days` : '🏆 Personal best!'}>
          </StatCard>

          <StatCard label="XP LEVEL" icon={Zap}
            value={`Lv. ${stats?.level || 1}`}
            sub={`${stats?.xp || 0} total XP`}>
            <XPBar xp={stats?.xp || 0} nextLevel={(stats?.level || 1) * 150} />
          </StatCard>
        </div>
      )}

      {/* AI Insight + Chart row */}
      <div className="grid grid-cols-5 gap-4">
        {/* AI Card */}
        <div className="content-card col-span-2 glass rounded-2xl p-5 relative overflow-hidden"
             style={{ borderLeft: '2px solid var(--theme-accent)' }}>
          <div className="absolute top-0 left-0 w-full h-0.5"
               style={{ background: 'linear-gradient(to right, var(--theme-accent), transparent)' }} />
          <div className="flex items-center gap-2 mb-3">
            <span className="label-eyebrow">TODAY'S AI INSIGHT</span>
          </div>
          {ai ? (
            <>
              <p className="text-white font-semibold text-sm mb-1">{ai.best_time_to_focus || 'Peak Focus Window'}</p>
              <p className="text-[#849495] text-sm leading-relaxed line-clamp-3">
                {ai.distraction_strategy || ai.mood_note || 'Your AI coach is analyzing your focus patterns…'}
              </p>
              <div className="mt-4 flex gap-2">
                {(ai.tips || []).slice(0, 1).map((tip, i) => (
                  <p key={i} className="text-xs text-[#849495] bg-white/3 rounded-lg px-3 py-2 line-clamp-2">{tip}</p>
                ))}
              </div>
              <Link to="/ai-coach" className="mt-3 inline-flex items-center gap-1 text-accent text-xs font-medium hover:gap-2 transition-all">
                Get Full Analysis <ChevronRight size={12} />
              </Link>
            </>
          ) : (
            <p className="text-[#849495] text-sm">Loading AI insight…</p>
          )}
        </div>

        {/* Weekly Focus Chart */}
        <div className="content-card col-span-3 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="label-eyebrow">WEEKLY FOCUS</span>
            <Link to="/analytics" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weekData} barSize={20}>
              <XAxis dataKey="day" tick={{ fill: '#849495', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#151d1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} min`, 'Focus']}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {weekData.map((_, i) => (
                  <Cell key={i}
                    fill={i === new Date().getDay() - 1 ? 'var(--theme-accent)' : 'rgba(255,255,255,0.06)'}
                    style={i === new Date().getDay() - 1 ? { filter: 'drop-shadow(0 0 4px var(--theme-accent))' } : {}}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Missions + Recent Tasks row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Daily Missions widget */}
        <div className="col-span-2">
          <DailyMissions onXPEarned={(xp) => { /* toast or stat refresh */ }} />
        </div>

        {/* Recent Tasks */}
        <div className="content-card col-span-3 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="label-eyebrow">ACTIVE TASKS</span>
          <Link to="/tasks" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-[#849495] text-sm py-4 text-center">No pending tasks. <Link to="/tasks" className="text-accent">Create one →</Link></p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task._id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/3 transition-colors group">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                     style={{ background: PRIORITY_COLOR[task.priority] || '#849495' }} />
                <span className="flex-1 text-sm text-[#dce4e4] truncate">{task.title}</span>
                {task.deadline && (
                  <span className="pill text-[10px] px-2 py-0.5 flex-shrink-0">
                    {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <span className={`pill text-[10px] px-2 py-0.5 flex-shrink-0 ${task.priority === 'high' ? 'pill-accent' : ''}`}
                      style={task.priority !== 'high' ? {} : {}}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
