import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Zap, Flame, Maximize2, Wind, Brain, Volume2, VolumeX } from 'lucide-react';
import { useFocus } from '../hook/useFocus';
import DeepWorkMode     from '../components/DeepWorkMode';
import BreathingWidget  from '../components/BreathingWidget';
import XPCelebration   from '../components/XPCelebration';
import { useSoundAlerts } from '../hook/useSoundAlerts';

function CircularTimer({ seconds, totalSeconds, size = 200 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const dash = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="var(--theme-accent)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 8px var(--theme-accent))' }}
      />
    </svg>
  );
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}

export default function FocusPage() {
  const { activeSession, stats, loading, startSession, endSession, fetchStats } = useFocus();

  const [mode,         setMode]         = useState('pomodoro');
  const [customMin,    setCustomMin]     = useState(45);
  const [breakMin,     setBreakMin]      = useState(5);
  const [mood,         setMood]          = useState('motivated');
  const [notes,        setNotes]         = useState('');
  const [distractions, setDistractions]  = useState(0);
  const [running,      setRunning]       = useState(false);
  const [phase,        setPhase]         = useState('focus');
  const [timeLeft,     setTimeLeft]      = useState(0);
  const [totalSec,     setTotalSec]      = useState(0);
  const [gamification, setGamification]  = useState(null);
  const [deepWork,     setDeepWork]      = useState(false);
  const [breathing,    setBreathing]     = useState(false);
  const [aiSuggestion, setAiSuggestion]  = useState(null);
  const [aiLoading,    setAiLoading]     = useState(false);
  const [celebration,  setCelebration]   = useState(null); // { xp, level, isLevelUp, badges }

  const { muted, toggleMute, playComplete, playBreakStart, playTick, playLevelUp } = useSoundAlerts();

  const tickRef = useRef(null);
  const focusDuration = mode === 'pomodoro' ? 25 : customMin;
  const breakDuration = mode === 'pomodoro' ? 5  : breakMin;

  useEffect(() => { fetchStats(); }, []);

  const fetchAISuggestion = async () => {
    setAiLoading(true);
    try {
      const { userService } = await import('../service/user.service');
      const res = await userService.getAdaptiveTimer();
      const s = res.suggestion;
      setAiSuggestion(s);
      // Apply suggestion to timer
      setMode('custom');
      setCustomMin(s.suggested_minutes || 25);
      setBreakMin(s.suggested_break || 5);
    } catch(e) { console.error(e); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          playComplete(); // 🔔 Sound: session done
          return 0;
        }
        if (t <= 5) playTick(); // 🔔 Tick for last 5 seconds
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running, playComplete, playTick]);

  const handleStart = async () => {
    try {
      await startSession({
        timerType: mode,
        mood,
        ...(mode === 'custom' && { focusDuration: customMin, breakDuration: breakMin }),
      });
      const secs = focusDuration * 60;
      setTotalSec(secs);
      setTimeLeft(secs);
      setPhase('focus');
      setRunning(true);
      setGamification(null);
    } catch (err) { alert('Could not start session: ' + err.message); }
  };

  const handleEnd = async () => {
    clearInterval(tickRef.current);
    setRunning(false);
    setDeepWork(false);
    if (!activeSession) return;
    try {
      const res = await endSession({ sessionId: activeSession._id, distractions, notes, mood, completed: timeLeft === 0 });
      if (res.gamification) {
        setGamification(res.gamification);
        const g = res.gamification;
        // 🎉 Show XP celebration
        if (g.xpEarned > 0) {
          if (g.leveledUp) playLevelUp();
          else playComplete();
          setCelebration({
            xp:        g.xpEarned,
            level:     g.level,
            isLevelUp: g.leveledUp || false,
            badges:    g.newBadges || [],
          });
        }
      }
    } catch (err) { alert('Could not end session: ' + err.message); }
  };

  const reset = () => {
    clearInterval(tickRef.current);
    setRunning(false);
    setDeepWork(false);
    setTimeLeft(0);
    setTotalSec(0);
    setGamification(null);
  };

  const MOODS = ['😴','😐','😊','🔥','⚡'];
  const MOOD_LABELS = ['sleepy','calm','happy','motivated','energized'];

  return (
    <div className="space-y-6">
      {/* XP Celebration Overlay */}
      {celebration && (
        <XPCelebration
          xp={celebration.xp}
          level={celebration.level}
          isLevelUp={celebration.isLevelUp}
          badges={celebration.badges}
          onDone={() => setCelebration(null)}
        />
      )}

      {/* Deep Work Mode overlay */}
      {deepWork && activeSession && (
        <DeepWorkMode
          timeLeft={timeLeft}
          totalSec={totalSec}
          phase={phase}
          taskLabel={notes || 'Deep Focus Session'}
          onExit={() => setDeepWork(false)}
          onEnd={handleEnd}
          distractions={distractions}
          onDistraction={() => setDistractions(d => d + 1)}
          notes={notes}
          onNotes={setNotes}
        />
      )}

      {/* Breathing Widget */}
      {breathing && <BreathingWidget onClose={() => setBreathing(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Focus Session</h1>
          <p className="text-[#849495] text-sm mt-0.5">
            {stats ? `${stats.totalSessionsCompleted || 0} sessions · ${stats.totalFocusMinutes || 0} min total` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Adaptive Timer */}
          {!running && !activeSession && (
            <button
              onClick={fetchAISuggestion}
              disabled={aiLoading}
              className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-purple-400 hover:text-purple-300 hover:border-purple-400/20 transition-all disabled:opacity-50"
            >
              <Brain size={14} className={aiLoading ? 'animate-pulse' : ''} />
              {aiLoading ? 'AI thinking…' : 'AI Suggest'}
            </button>
          )}
          {/* Breathing Exercise quick-access */}
          <button
            onClick={() => setBreathing(true)}
            className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-[#849495] hover:text-accent hover:border-accent/20 transition-all"
          >
            <Wind size={14} /> Breathing
          </button>
          {/* Sound mute toggle */}
          <button onClick={toggleMute}
            className={`w-9 h-9 rounded-xl glass flex items-center justify-center transition-all ${muted ? 'text-[#849495]' : 'text-accent'}`}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}>
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Timer Card */}
        <div className="col-span-2 glass-glow rounded-3xl p-8 flex flex-col items-center">
          {/* Mode Toggle */}
          {!running && !activeSession && (
            <div className="flex gap-1 glass rounded-full p-1 mb-8">
              {['pomodoro','custom'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    mode === m ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
                  }`}>
                  {m === 'pomodoro' ? '25/5 Pomodoro' : 'Custom'}
                </button>
              ))}
            </div>
          )}

          {/* Circular Timer */}
          <div className="relative flex items-center justify-center mb-6">
            <CircularTimer seconds={timeLeft || (focusDuration * 60)} totalSeconds={totalSec || (focusDuration * 60)} size={220} />
            <div className="absolute text-center">
              <div className="text-5xl font-bold text-white tracking-tighter tabular-nums">
                {fmt(timeLeft || focusDuration * 60)}
              </div>
              <div className="text-[#849495] text-xs mt-1 uppercase tracking-widest">{phase} phase</div>
            </div>
          </div>

          {/* Custom Duration */}
          {mode === 'custom' && !running && !activeSession && (
            <div className="flex gap-4 mb-6">
              <div className="text-center">
                <label className="label-eyebrow block mb-1">Focus (min)</label>
                <input type="number" min={5} max={120} value={customMin}
                       onChange={e => setCustomMin(Number(e.target.value))}
                       className="w-16 text-center input-minimal text-lg font-bold" />
              </div>
              <div className="text-center">
                <label className="label-eyebrow block mb-1">Break (min)</label>
                <input type="number" min={1} max={30} value={breakMin}
                       onChange={e => setBreakMin(Number(e.target.value))}
                       className="w-16 text-center input-minimal text-lg font-bold" />
              </div>
            </div>
          )}

          {/* AI Suggestion Card */}
          {aiSuggestion && !running && !activeSession && (
            <div className="w-full mb-4 glass rounded-xl p-4 border border-purple-400/20 bg-purple-500/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain size={12} className="text-purple-400" />
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">AI Suggestion Applied</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  aiSuggestion.confidence === 'high'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' :
                  aiSuggestion.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-400/20' :
                  'bg-white/5 text-[#849495] border-white/10'
                }`}>{aiSuggestion.confidence} confidence</span>
              </div>
              <p className="text-white text-sm mb-1">
                <span className="text-purple-400 font-bold">{aiSuggestion.suggested_minutes}min</span> focus ·{' '}
                <span className="text-purple-400 font-bold">{aiSuggestion.suggested_break}min</span> break
              </p>
              <p className="text-[#849495] text-xs leading-relaxed">{aiSuggestion.reasoning}</p>
              {aiSuggestion.tip && <p className="text-purple-300 text-xs mt-2 italic">💡 {aiSuggestion.tip}</p>}
              <button onClick={() => setAiSuggestion(null)} className="text-[#849495] text-[10px] mt-2 hover:text-white">dismiss</button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!activeSession ? (
              <button onClick={handleStart} disabled={loading} className="btn-primary px-10 py-3 text-base">
                <Play size={16} fill="currentColor" /> Start Focus
              </button>
            ) : (
              <>
                {/* Deep Work Mode button — only when session is active */}
                <button
                  onClick={() => setDeepWork(true)}
                  className="flex items-center gap-2 glass-glow px-5 py-3 rounded-xl text-accent text-sm font-medium border border-accent/20 hover:bg-accent-dim transition-all"
                  style={{ boxShadow: '0 0 12px rgba(0,245,255,0.08)' }}
                >
                  <Maximize2 size={14} /> Deep Work
                </button>
                <button onClick={handleEnd} disabled={loading} className="btn-primary px-8 py-3">
                  <Square size={14} fill="currentColor" /> End Session
                </button>
                <button onClick={reset} className="btn-ghost px-4 py-3">
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </div>

          {/* Gamification Result */}
          {gamification && (
            <div className="mt-6 glass-glow rounded-2xl p-4 text-center w-full">
              <p className="text-accent font-bold text-lg">+{gamification.xpEarned} XP</p>
              <p className="text-[#849495] text-sm">Level {gamification.level} · Streak {gamification.streak} days</p>
              {gamification.newBadges?.length > 0 && (
                <p className="text-amber-400 text-sm mt-1">🏅 New badge: {gamification.newBadges.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        {/* Session Settings */}
        <div className="space-y-4">
          {/* Mood */}
          <div className="glass rounded-2xl p-4">
            <p className="label-eyebrow mb-3">YOUR MOOD</p>
            <div className="flex justify-between">
              {MOODS.map((em, i) => (
                <button key={i} onClick={() => setMood(MOOD_LABELS[i])}
                  className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    mood === MOOD_LABELS[i] ? 'bg-accent-dim ring-1 ring-accent' : 'hover:bg-white/5'
                  }`}>{em}</button>
              ))}
            </div>
          </div>

          {/* Distractions */}
          {activeSession && (
            <div className="glass rounded-2xl p-4">
              <p className="label-eyebrow mb-3">DISTRACTIONS</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDistractions(d => Math.max(0, d - 1))}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white">−</button>
                <span className="text-2xl font-bold text-white w-8 text-center">{distractions}</span>
                <button onClick={() => setDistractions(d => d + 1)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white">+</button>
              </div>
            </div>
          )}

          {/* Notes */}
          {activeSession && (
            <div className="glass rounded-2xl p-4">
              <p className="label-eyebrow mb-3">SESSION NOTES</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        className="input-minimal resize-none text-sm w-full" rows={4}
                        placeholder="What are you working on?" />
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="label-eyebrow">YOUR STATS</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#849495]">Streak</span>
                <span className="text-orange-400 font-semibold flex items-center gap-1">
                  <Flame size={12} />{stats.currentStreak || 0} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#849495]">Total Sessions</span>
                <span className="text-white font-semibold">{stats.totalSessionsCompleted || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#849495]">Total Focus</span>
                <span className="text-accent font-semibold">{Math.round((stats.totalFocusMinutes || 0) / 60)}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
