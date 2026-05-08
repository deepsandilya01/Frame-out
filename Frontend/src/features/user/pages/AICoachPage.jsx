import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, FileText, Loader, RefreshCw, Sparkles } from 'lucide-react';
import { useAIInsights } from '../hook/useAIInsights';

function InsightCard({ title, icon: Icon, children, onRefresh, loading }) {
  return (
    <div className="glass-glow rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--theme-accent)' }} />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center">
            <Icon size={14} className="text-accent" />
          </div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        <button onClick={onRefresh} disabled={loading}
                className="w-7 h-7 rounded-lg text-[#849495] hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {children}
    </div>
  );
}

function ListItem({ text }) {
  return (
    <li className="flex gap-2 text-sm text-[#b9caca] leading-relaxed">
      <span className="text-accent mt-1 flex-shrink-0">▸</span>
      {text}
    </li>
  );
}

export default function AICoachPage() {
  const { ai, fetchAnalysis, fetchSuggestions, fetchWeeklyReport, fetchAll } = useAIInsights();
  const [tab, setTab] = useState('analysis'); // 'analysis' | 'suggestions' | 'report'

  useEffect(() => { fetchAll(); }, []);

  const { analysis, suggestions, weeklyReport, loading, error } = ai;

  const TABS = [
    { id: 'analysis',    label: 'Analysis',    icon: TrendingUp },
    { id: 'suggestions', label: 'Suggestions', icon: Sparkles },
    { id: 'report',      label: 'Weekly Report',icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center"
             style={{ border: '1px solid rgba(0,245,255,0.3)' }}>
          <Brain size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Coach</h1>
          <p className="text-[#849495] text-sm">Powered by Mistral AI · Personalized for your flow</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-full p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              tab === t.id ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
            }`}>
            <t.icon size={11} />{t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
          AI service error. Check your MISTRAL_API_KEY.
          <button onClick={fetchAll} className="ml-auto text-accent underline">Retry</button>
        </div>
      )}

      {/* Analysis Tab */}
      {tab === 'analysis' && (
        <InsightCard title="Productivity Analysis" icon={TrendingUp}
                     onRefresh={fetchAnalysis} loading={loading}>
          {!analysis ? (
            <div className="flex items-center gap-2 text-[#849495] text-sm">
              {loading ? <><Loader size={14} className="animate-spin" />Analyzing your patterns…</> : 'Click refresh to get insights'}
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.overall_score !== undefined && (
                <div>
                  <p className="label-eyebrow mb-2">OVERALL SCORE</p>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-bold text-accent">{analysis.overall_score}</div>
                    <div className="flex-1 h-2 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-accent"
                           style={{ width: `${analysis.overall_score}%`, boxShadow: '0 0 8px var(--theme-accent)' }} />
                    </div>
                    <span className="text-[#849495] text-sm">/100</span>
                  </div>
                </div>
              )}

              {analysis.strengths?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">STRENGTHS</p>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s, i) => <ListItem key={i} text={s} />)}
                  </ul>
                </div>
              )}

              {analysis.areas_for_improvement?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">GROWTH AREAS</p>
                  <ul className="space-y-1.5">
                    {analysis.areas_for_improvement.map((s, i) => <ListItem key={i} text={s} />)}
                  </ul>
                </div>
              )}

              {analysis.summary && (
                <p className="text-[#849495] text-sm leading-relaxed border-t border-white/5 pt-4">
                  {analysis.summary}
                </p>
              )}
            </div>
          )}
        </InsightCard>
      )}

      {/* Suggestions Tab */}
      {tab === 'suggestions' && (
        <InsightCard title="Focus Suggestions" icon={Sparkles}
                     onRefresh={fetchSuggestions} loading={loading}>
          {!suggestions ? (
            <div className="flex items-center gap-2 text-[#849495] text-sm">
              {loading ? <><Loader size={14} className="animate-spin" />Generating suggestions…</> : 'Click refresh to get suggestions'}
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.best_time_to_focus && (
                <div className="glass-mid rounded-xl p-4">
                  <p className="label-eyebrow mb-1">OPTIMAL FOCUS TIME</p>
                  <p className="text-accent font-semibold">{suggestions.best_time_to_focus}</p>
                </div>
              )}
              {suggestions.tips?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">TIPS</p>
                  <ul className="space-y-2">
                    {suggestions.tips.map((tip, i) => <ListItem key={i} text={tip} />)}
                  </ul>
                </div>
              )}
              {suggestions.distraction_strategy && (
                <div>
                  <p className="label-eyebrow mb-2">DISTRACTION STRATEGY</p>
                  <p className="text-sm text-[#b9caca] leading-relaxed">{suggestions.distraction_strategy}</p>
                </div>
              )}
              {suggestions.mood_note && (
                <div className="glass-mid rounded-xl p-3">
                  <p className="text-xs text-[#849495] italic">{suggestions.mood_note}</p>
                </div>
              )}
            </div>
          )}
        </InsightCard>
      )}

      {/* Weekly Report Tab */}
      {tab === 'report' && (
        <InsightCard title="Weekly Performance Report" icon={FileText}
                     onRefresh={fetchWeeklyReport} loading={loading}>
          {!weeklyReport ? (
            <div className="flex items-center gap-2 text-[#849495] text-sm">
              {loading ? <><Loader size={14} className="animate-spin" />Generating report…</> : 'Click refresh to generate report'}
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyReport.performance_rating && (
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-accent">{weeklyReport.performance_rating}</div>
                  <div>
                    <p className="text-white font-semibold">{weeklyReport.headline || 'Weekly Performance'}</p>
                    <p className="text-[#849495] text-xs">{weeklyReport.period}</p>
                  </div>
                </div>
              )}
              {weeklyReport.highlights?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">HIGHLIGHTS</p>
                  <ul className="space-y-1.5">
                    {weeklyReport.highlights.map((h, i) => <ListItem key={i} text={h} />)}
                  </ul>
                </div>
              )}
              {weeklyReport.recommendations?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">NEXT WEEK RECOMMENDATIONS</p>
                  <ul className="space-y-1.5">
                    {weeklyReport.recommendations.map((r, i) => <ListItem key={i} text={r} />)}
                  </ul>
                </div>
              )}
              {weeklyReport.message && (
                <div className="glass-mid rounded-xl p-4 border-l-2 border-accent/50">
                  <p className="text-sm text-[#dce4e4] italic leading-relaxed">"{weeklyReport.message}"</p>
                </div>
              )}
            </div>
          )}
        </InsightCard>
      )}
    </div>
  );
}
