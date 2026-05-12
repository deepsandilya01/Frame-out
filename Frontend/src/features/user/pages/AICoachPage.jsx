import React, { useEffect, useState } from 'react';
import { Brain, Zap, FileText, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { userService } from '../service/user.service';

const STATUS_COLORS = {
  thriving:        { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: '#10b981', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
  stable:          { bg: 'rgba(0,245,255,0.06)',  border: 'rgba(0,245,255,0.2)',   text: '#00F5FF', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20' },
  at_risk:         { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', badge: 'bg-amber-500/10 text-amber-400 border-amber-400/20' },
  burnout_detected:{ bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)',   text: '#ef4444', badge: 'bg-red-500/10 text-red-400 border-red-400/20' },
};

const RISK_COLORS = { none: '#10b981', low: '#00F5FF', medium: '#fbbf24', high: '#ef4444' };

function Section({ icon: Icon, title, children, loading, onRefresh }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-accent" />
          <span className="text-white text-sm font-semibold">{title}</span>
        </div>
        <button onClick={onRefresh} disabled={loading}
          className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all">
          <RefreshCw size={12} className={`text-[#849495] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Typewriter({ text, speed = 20 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span>{displayed}</span>;
}

function Loader() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-5 h-5 rounded-full border-2 border-accent/20 border-t-accent animate-spin flex-shrink-0" />
      <span className="text-[#849495] text-sm animate-pulse">Mistral AI is analyzing your data...</span>
    </div>
  );
}

export default function AICoachPage() {
  const [tab, setTab] = useState('analysis');

  const [analysis,  setAnalysis]  = useState(null);
  const [analysisL, setAnalysisL] = useState(false);

  const [suggestions, setSuggestions] = useState(null);
  const [suggestL,    setSuggestL]    = useState(false);

  const [report,  setReport]  = useState(null);
  const [reportL, setReportL] = useState(false);

  const [burnout,  setBurnout]  = useState(null);
  const [burnoutL, setBurnoutL] = useState(false);

  const fetchAnalysis = async () => {
    setAnalysisL(true);
    try { const r = await userService.getProductivityAnalysis(); setAnalysis(r.analysis); }
    catch (e) { setAnalysis({ _error: e.message }); }
    finally { setAnalysisL(false); }
  };

  const fetchSuggestions = async () => {
    setSuggestL(true);
    try { const r = await userService.getFocusSuggestions(); setSuggestions(r.suggestions); }
    catch (e) { setSuggestions({ _error: e.message }); }
    finally { setSuggestL(false); }
  };

  const fetchReport = async () => {
    setReportL(true);
    try { const r = await userService.getWeeklyReport(); setReport(r.report); }
    catch (e) { setReport({ _error: e.message }); }
    finally { setReportL(false); }
  };

  const fetchBurnout = async () => {
    setBurnoutL(true);
    try { const r = await userService.getBurnoutCheck(); setBurnout(r.burnout); }
    catch (e) { setBurnout({ _error: e.message }); }
    finally { setBurnoutL(false); }
  };

  // Load on tab switch
  useEffect(() => {
    if (tab === 'analysis'   && !analysis)    fetchAnalysis();
    if (tab === 'suggestions'&& !suggestions) fetchSuggestions();
    if (tab === 'report'     && !report)      fetchReport();
    if (tab === 'burnout'    && !burnout)     fetchBurnout();
  }, [tab]);

  const TABS = [
    { key: 'analysis',    icon: Brain,         label: 'Analysis' },
    { key: 'suggestions', icon: Zap,           label: 'Suggestions' },
    { key: 'report',      icon: FileText,      label: 'Weekly Report' },
    { key: 'burnout',     icon: AlertTriangle, label: 'Burnout Check' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center shrink-0"
             style={{ border: '1px solid rgba(0,245,255,0.3)' }}>
          <Brain size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Coach</h1>
          <p className="text-[#849495] text-sm">Powered by Mistral AI · Personalized for your flow</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 glass rounded-2xl sm:rounded-full p-1 w-full sm:w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-medium transition-all flex-1 sm:flex-none ${
              tab === t.key
                ? t.key === 'burnout'
                  ? 'bg-red-500/10 text-red-400 border border-red-400/20'
                  : 'bg-accent-dim text-accent border border-accent/20'
                : 'text-[#849495] hover:text-white'
            }`}>
            <t.icon size={11} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Analysis Tab ── */}
      {tab === 'analysis' && (
        <Section icon={Brain} title="Productivity Analysis" loading={analysisL} onRefresh={fetchAnalysis}>
          {analysisL ? <Loader /> : analysis?._error ? (
            <p className="text-red-400 text-sm">{analysis._error}</p>
          ) : analysis ? (
            <div className="space-y-4">
              {analysis.headline && (
                <p className="text-accent font-semibold text-base"><Typewriter text={analysis.headline} speed={15} /></p>
              )}
              {analysis.score_interpretation && (
                <p className="text-[#849495] text-sm leading-relaxed"><Typewriter text={analysis.score_interpretation} speed={8} /></p>
              )}
              {analysis.strengths?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">STRENGTHS</p>
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#dce4e4] mb-1.5">
                      <span className="text-accent mt-0.5">▸</span><Typewriter text={s} speed={10} />
                    </div>
                  ))}
                </div>
              )}
              {analysis.areas_to_improve?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">AREAS TO IMPROVE</p>
                  {analysis.areas_to_improve.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#849495] mb-1.5">
                      <span className="text-amber-400 mt-0.5">▸</span><Typewriter text={a} speed={10} />
                    </div>
                  ))}
                </div>
              )}
              {analysis.distraction_insight && (
                <div className="glass rounded-xl p-3 border-l-2 border-amber-400/50">
                  <p className="text-amber-400 text-xs font-semibold mb-0.5">DISTRACTION INSIGHT</p>
                  <p className="text-[#dce4e4] text-sm"><Typewriter text={analysis.distraction_insight} speed={12} /></p>
                </div>
              )}
              {analysis.tomorrow_goal && (
                <div className="glass-glow rounded-xl p-3">
                  <p className="label-eyebrow mb-1">TOMORROW'S GOAL</p>
                  <p className="text-accent text-sm font-medium"><Typewriter text={analysis.tomorrow_goal} speed={15} /></p>
                </div>
              )}
            </div>
          ) : null}
        </Section>
      )}

      {/* ── Suggestions Tab ── */}
      {tab === 'suggestions' && (
        <Section icon={Zap} title="Focus Suggestions" loading={suggestL} onRefresh={fetchSuggestions}>
          {suggestL ? <Loader /> : suggestions?._error ? (
            <p className="text-red-400 text-sm">{suggestions._error}</p>
          ) : suggestions ? (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-accent" />
                </div>
                <div>
                  <p className="label-eyebrow mb-0.5 opacity-60">OPTIMAL FOCUS TIME</p>
                  <p className="text-accent font-bold text-lg"><Typewriter text={suggestions.best_time_to_focus} speed={25} /></p>
                </div>
                <div className="sm:ml-auto">
                  <p className="label-eyebrow mb-0.5 opacity-60">RECOMMENDED SESSION</p>
                  <p className="text-white font-bold">{suggestions.optimal_session_length}m focus · {suggestions.optimal_break_length}m break</p>
                </div>
              </div>
              {suggestions.tips?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">TIPS</p>
                  {suggestions.tips.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#dce4e4] mb-2">
                      <span className="text-accent mt-0.5">▸</span><Typewriter text={t} speed={10} />
                    </div>
                  ))}
                </div>
              )}
              {suggestions.distraction_strategy && (
                <div>
                  <p className="label-eyebrow mb-1">DISTRACTION STRATEGY</p>
                  <p className="text-[#dce4e4] text-sm leading-relaxed"><Typewriter text={suggestions.distraction_strategy} speed={12} /></p>
                </div>
              )}
              {suggestions.mood_note && (
                <div className="glass rounded-xl p-3 border border-white/5">
                  <p className="text-[#849495] text-xs italic"><Typewriter text={suggestions.mood_note} speed={15} /></p>
                </div>
              )}
            </div>
          ) : null}
        </Section>
      )}

      {/* ── Weekly Report Tab ── */}
      {tab === 'report' && (
        <Section icon={FileText} title="Weekly Report" loading={reportL} onRefresh={fetchReport}>
          {reportL ? <Loader /> : report?._error ? (
            <p className="text-red-400 text-sm">{report._error}</p>
          ) : report ? (
            <div className="space-y-4">
              {report.title && <p className="text-accent font-bold text-lg"><Typewriter text={report.title} speed={25} /></p>}
              {report.summary && <p className="text-[#849495] text-sm leading-relaxed"><Typewriter text={report.summary} speed={8} /></p>}
              {report.trend && (
                <div className={`pill text-sm px-3 py-1 ${
                  report.trend === 'improving' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20' :
                  report.trend === 'declining' ? 'text-red-400 bg-red-500/10 border-red-400/20' :
                  'text-[#849495] bg-white/5'
                }`}>
                  {report.trend === 'improving' ? '↑' : report.trend === 'declining' ? '↓' : '→'} {report.trend}
                  {report.trend_explanation && ` · ${report.trend_explanation}`}
                </div>
              )}
              {report.highlights?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">HIGHLIGHTS</p>
                  {report.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#dce4e4] mb-1.5">
                      <span className="text-amber-400">★</span><Typewriter text={h} speed={12} />
                    </div>
                  ))}
                </div>
              )}
              {report.next_week_plan && (
                <div className="glass rounded-xl p-4">
                  <p className="label-eyebrow mb-3">NEXT WEEK PLAN</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-accent font-bold text-xl">{report.next_week_plan.focus_goal_hours}h</p>
                      <p className="text-[#849495] text-xs">Focus Goal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-bold text-xl">{report.next_week_plan.session_goal}</p>
                      <p className="text-[#849495] text-xs">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-bold text-xl">{report.next_week_plan.task_goal}</p>
                      <p className="text-[#849495] text-xs">Tasks</p>
                    </div>
                  </div>
                  {report.next_week_plan.key_habit && (
                    <p className="text-[#dce4e4] text-sm">🎯 <Typewriter text={report.next_week_plan.key_habit} speed={15} /></p>
                  )}
                </div>
              )}
              {report.motivational_close && (
                <p className="text-white italic text-sm text-center py-2 border-t border-white/5">
                  "<Typewriter text={report.motivational_close} speed={10} />"
                </p>
              )}
            </div>
          ) : null}
        </Section>
      )}

      {/* ── Burnout Check Tab ── */}
      {tab === 'burnout' && (
        <Section icon={AlertTriangle} title="Burnout Detection" loading={burnoutL} onRefresh={fetchBurnout}>
          {burnoutL ? <Loader /> : burnout?._error ? (
            <p className="text-red-400 text-sm">{burnout._error}</p>
          ) : burnout ? (() => {
            const sc = STATUS_COLORS[burnout.status] || STATUS_COLORS.stable;
            return (
              <div className="space-y-4">
                {/* Status card */}
                <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
                     style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                  {/* Risk gauge */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none"
                              stroke={RISK_COLORS[burnout.risk_level] || '#849495'} strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 32}
                              strokeDashoffset={2 * Math.PI * 32 * (1 - (burnout.risk_score || 0) / 100)}
                              style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{burnout.risk_score}</p>
                        <p className="text-[9px] text-[#849495] uppercase">risk</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className={`pill text-[10px] mb-2 px-3 ${sc.badge}`}>
                      {burnout.status?.replace('_', ' ').toUpperCase()}
                    </div>
                    <p className="text-white font-bold text-base">{burnout.headline}</p>
                    <p className="text-[#849495] text-xs mt-1 uppercase tracking-widest font-medium">Risk Level: <span style={{ color: RISK_COLORS[burnout.risk_level] }}>{burnout.risk_level}</span></p>
                  </div>
                </div>

                {burnout.signals?.length > 0 && (
                  <div>
                    <p className="label-eyebrow mb-2">DETECTED SIGNALS</p>
                    {burnout.signals.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-400 mb-1.5">
                        <span>⚠</span><Typewriter text={s} speed={10} />
                      </div>
                    ))}
                  </div>
                )}

                {burnout.recommendations?.length > 0 && (
                  <div>
                    <p className="label-eyebrow mb-2">RECOMMENDATIONS</p>
                    {burnout.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#dce4e4] mb-1.5">
                        <span className="text-accent">▸</span><Typewriter text={r} speed={12} />
                      </div>
                    ))}
                  </div>
                )}

                {burnout.recovery_plan && (
                  <div className="glass rounded-xl p-3 border-l-2 border-emerald-400/50">
                    <p className="text-emerald-400 text-xs font-semibold mb-0.5">TODAY'S RECOVERY PLAN</p>
                    <p className="text-[#dce4e4] text-sm"><Typewriter text={burnout.recovery_plan} speed={10} /></p>
                  </div>
                )}

                {burnout.encouragement && (
                  <p className="text-white italic text-sm text-center py-2 border-t border-white/5">
                    "<Typewriter text={burnout.encouragement} speed={15} />"
                  </p>
                )}
              </div>
            );
          })() : null}
        </Section>
      )}
    </div>
  );
}
