import React, { useEffect, useState, useRef } from 'react';
import { Play, Square, RotateCcw, Zap, Flame, Maximize2, Wind, Brain, Target, Clock, Headphones, X } from 'lucide-react';
import { useFocus } from '../hook/useFocus';
import DeepWorkMode     from '../components/DeepWorkMode';
import BreathingWidget  from '../components/BreathingWidget';
import { useSoundAlerts } from '../hook/useSoundAlerts';

function CircularTimer({ seconds, totalSeconds, size = 200 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const dash = circ * (1 - pct);
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
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
  const [lofiPlaying,  setLofiPlaying]   = useState(false);

  const { muted, toggleMute, playComplete, playBreakStart, playTick, playLevelUp } = useSoundAlerts();

  const tickRef = useRef(null);
  const focusDuration = mode === 'pomodoro' ? 25 : customMin;
  const breakDuration = mode === 'pomodoro' ? 5  : breakMin;

  useEffect(() => { fetchStats(); }, [fetchStats]);

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

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (running) {
      document.title = `(${fmt(timeLeft)}) In The Zone ⚡`;
    } else {
      document.title = 'Frame-Out';
    }
    return () => { document.title = 'Frame-Out'; };
  }, [timeLeft, running]);

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
    if (!activeSession) {
      setTimeLeft(0);
      setTotalSec(0);
      return;
    }
    try {
      const res = await endSession({ sessionId: activeSession._id, distractions, notes, mood, completed: timeLeft === 0 });
      setTimeLeft(0);
      setTotalSec(0);
      setDistractions(0);
      setNotes('');
      if (res.gamification) {
        setGamification(res.gamification);
        const g = res.gamification;
        // Celebration handled globally by AppLayout level listener
        if (g.xpEarned > 0) {
          if (g.leveledUp) playLevelUp();
          else playComplete();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Focus Session</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[#849495] text-xs sm:text-sm">
            <span className="flex items-center gap-1"><Target size={12} className="text-accent" /> {stats?.totalSessionsCompleted || 0} sessions</span>
            <span className="w-1 h-1 rounded-full bg-white/10 hidden sm:inline" />
            <span className="flex items-center gap-1"><Clock size={12} className="text-accent" /> {stats?.totalFocusMinutes || 0} min total</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          
          {/* Lofi toggle */}
          <button onClick={() => {
              const aud = document.getElementById('lofi-audio');
              if (!aud) return;
              if (lofiPlaying) { aud.pause(); setLofiPlaying(false); }
              else { aud.play(); setLofiPlaying(true); }
            }}
            className={`w-9 h-9 rounded-xl glass flex items-center justify-center transition-all ${!lofiPlaying ? 'text-[#849495] hover:text-white' : 'text-accent bg-accent/10 border border-accent/20'}`}
            title={!lofiPlaying ? 'Play Lofi Concentration Music' : 'Pause Lofi'}>
            <Headphones size={14} className={lofiPlaying ? 'animate-pulse' : ''} />
          </button>
          <audio id="lofi-audio" loop src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" preload="none"></audio>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Card */}
        <div className="lg:col-span-2 glass-glow rounded-3xl p-6 sm:p-8 flex flex-col items-center">
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
          <div className="relative flex items-center justify-center mb-8 w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
            <CircularTimer seconds={timeLeft || (focusDuration * 60)} totalSeconds={totalSec || (focusDuration * 60)} size={320} />
            <div className="absolute text-center">
              <div className="text-5xl sm:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {fmt(timeLeft || focusDuration * 60)}
              </div>
              <div className="text-accent text-[10px] sm:text-xs mt-2 uppercase tracking-[0.2em] font-bold opacity-80">{phase} phase</div>
            </div>
          </div>

          {/* Custom Duration */}
          {mode === 'custom' && !running && !activeSession && (
            <div className="flex gap-6 mb-8 glass px-6 py-4 rounded-2xl border-white/5">
              <div className="text-center">
                <label className="label-eyebrow block mb-2 opacity-60">Focus</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={5} max={120} value={customMin}
                         onChange={e => setCustomMin(Number(e.target.value))}
                         className="w-14 text-center bg-transparent border-b border-accent/30 focus:border-accent text-xl font-bold text-white outline-none transition-colors" />
                  <span className="text-[10px] text-[#849495] font-bold uppercase">min</span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div className="text-center">
                <label className="label-eyebrow block mb-2 opacity-60">Break</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={30} value={breakMin}
                         onChange={e => setBreakMin(Number(e.target.value))}
                         className="w-14 text-center bg-transparent border-b border-white/20 focus:border-accent text-xl font-bold text-white outline-none transition-colors" />
                  <span className="text-[10px] text-[#849495] font-bold uppercase">min</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestion Card */}
          {aiSuggestion && !running && !activeSession && (
            <div className="w-full mb-8 glass-glow rounded-2xl p-5 border-purple-500/40 bg-purple-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <Brain size={40} className="text-purple-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">AI Adaptive Zone</span>
                </div>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                  aiSuggestion.confidence === 'high'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' :
                  aiSuggestion.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-400/20' :
                  'bg-white/5 text-[#849495] border-white/10'
                }`}>{aiSuggestion.confidence} Match</span>
              </div>
              <h3 className="text-white text-lg font-bold mb-1">
                {aiSuggestion.suggested_minutes}m <span className="text-purple-300/60 font-medium text-sm">Focus</span> ·{' '}
                {aiSuggestion.suggested_break}m <span className="text-purple-300/60 font-medium text-sm">Break</span>
              </h3>
              <p className="text-[#849495] text-xs leading-relaxed max-w-[90%]">{aiSuggestion.reasoning}</p>
              {aiSuggestion.tip && (
                <div className="mt-3 flex items-start gap-2 text-purple-300 text-xs bg-purple-400/10 p-2 rounded-lg border border-purple-400/10">
                   <Zap size={12} className="mt-0.5 flex-shrink-0" fill="currentColor" />
                   <p className="italic">{aiSuggestion.tip}</p>
                </div>
              )}
              <button onClick={() => setAiSuggestion(null)} className="absolute top-3 right-3 text-[#849495] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {!activeSession ? (
              <button onClick={handleStart} disabled={loading} className="btn-primary w-full sm:w-auto px-12 py-4 text-base font-bold shadow-[0_0_30px_rgba(0,245,255,0.15)]">
                <Play size={18} fill="currentColor" /> Start Focus
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                {/* Deep Work Mode button — only when session is active */}
                <button
                  onClick={() => setDeepWork(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 glass-glow px-6 py-4 rounded-2xl text-accent text-sm font-bold border-accent/30 hover:bg-accent-dim transition-all active:scale-95"
                >
                  <Maximize2 size={16} /> DEEP WORK
                </button>
                <button onClick={handleEnd} disabled={loading} className="flex-1 sm:flex-none btn-primary px-8 py-4 font-bold border-red-500/40 text-red-400 hover:bg-red-500/5 shadow-none">
                  <Square size={16} fill="currentColor" /> END
                </button>
                <button onClick={reset} className="w-12 h-14 rounded-2xl glass flex items-center justify-center text-[#849495] hover:text-white transition-all active:scale-90">
                  <RotateCcw size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Gamification Result */}
          {gamification && (
            <div className="mt-8 glass-glow rounded-3xl p-6 text-center w-full max-w-sm animate-fade-in border-accent/20">
              <div className="flex items-center justify-center gap-2 text-accent text-3xl font-black mb-1">
                <Zap size={24} fill="currentColor" />
                <span>+{gamification.xpEarned} XP</span>
              </div>
              <p className="text-white font-bold">Level {gamification.level} Reached</p>
              <p className="text-[#849495] text-xs uppercase tracking-widest mt-1">{gamification.streak} Day Streak!</p>
              {gamification.newBadges?.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {gamification.newBadges.map(b => (
                    <span key={b} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      🏅 {b}
                    </span>
                  ))}
                </div>
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
