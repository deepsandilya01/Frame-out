import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, Minimize2, Wind, BookOpen, Volume2, VolumeX } from 'lucide-react';

function fmt(s) {
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}

function CircularTimer({ seconds, totalSeconds }) {
  const size = 280;
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const pct = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const dash = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--theme-accent)" strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 12px var(--theme-accent))' }}
      />
    </svg>
  );
}

const QUOTES = [
  "The successful warrior is the average man, with laser-like focus.",
  "Where focus goes, energy flows.",
  "Concentrate all your thoughts upon the work at hand.",
  "Deep work is the superpower of the 21st century.",
  "The ability to focus is the foundation of every other human discipline.",
];

export default function DeepWorkMode({ timeLeft, totalSec, phase, taskLabel, onExit, onEnd, distractions, onDistraction, notes, onNotes }) {
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);
  const quoteRef   = useRef(null);
  const [quote, setQuote]   = useState(QUOTES[0]);
  const [muted, setMuted]   = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const audioRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(cardRef.current,
      { scale: 0.92, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)', delay: 0.1 }
    );
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Rotate quotes every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIdx(i => {
        const next = (i + 1) % QUOTES.length;
        setQuote(QUOTES[next]);
        gsap.fromTo(quoteRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 });
        return next;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // ESC key exits
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleExit(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleExit = () => {
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, onComplete: onExit
    });
  };

  const pct = totalSec > 0 ? Math.round((1 - timeLeft / totalSec) * 100) : 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(4,4,4,0.97)', backdropFilter: 'blur(24px)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-40 -left-40 opacity-5"
             style={{ background: 'radial-gradient(circle, var(--theme-accent), transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full -bottom-32 -right-32 opacity-5"
             style={{ background: 'radial-gradient(circle, var(--theme-accent), transparent 70%)' }} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"
               style={{ boxShadow: '0 0 8px var(--theme-accent)' }} />
          <span className="text-[#849495] text-sm font-medium uppercase tracking-widest">Deep Work</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMuted(m => !m)}
                  className="w-8 h-8 rounded-lg text-[#849495] hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button onClick={handleExit}
                  className="flex items-center gap-1.5 text-[#849495] hover:text-white text-xs transition-all hover:bg-white/5 px-3 py-1.5 rounded-full">
            <Minimize2 size={12} /> Exit Deep Work
          </button>
        </div>
      </div>

      {/* Main card */}
      <div ref={cardRef} className="flex flex-col items-center gap-8 max-w-lg w-full px-8">

        {/* Task label */}
        {taskLabel && (
          <div className="pill-accent text-sm px-5 py-2 text-center max-w-xs truncate">
            🎯 {taskLabel}
          </div>
        )}

        {/* Timer */}
        <div className="relative flex items-center justify-center">
          <CircularTimer seconds={timeLeft} totalSeconds={totalSec} />
          <div className="absolute text-center">
            <div className="text-7xl font-bold text-white tracking-tighter tabular-nums"
                 style={{ textShadow: '0 0 40px rgba(0,245,255,0.1)' }}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[#849495] text-xs uppercase tracking-widest mt-1">{phase} · {pct}% done</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 rounded-full bg-white/5">
          <div className="h-full rounded-full transition-all duration-1000"
               style={{ width: `${pct}%`, background: 'var(--theme-accent)', boxShadow: '0 0 8px var(--theme-accent)' }} />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4">
          {/* Distraction counter */}
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-[#849495] text-xs uppercase tracking-wider">Distracted</span>
            <button onClick={onDistraction}
                    className="w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all">
              +
            </button>
            <span className="text-white font-bold tabular-nums text-lg w-6 text-center">{distractions}</span>
          </div>

          {/* End session */}
          <button onClick={onEnd}
                  className="btn-primary px-6 py-2.5">
            <X size={14} /> End Session
          </button>
        </div>

        {/* Notes */}
        <div className="w-full">
          <textarea
            value={notes}
            onChange={e => onNotes(e.target.value)}
            placeholder="Session notes… (what are you working on?)"
            className="w-full input-minimal resize-none text-sm text-center placeholder:text-center"
            rows={2}
            style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}
          />
        </div>

        {/* Quote */}
        <p ref={quoteRef} className="text-[#849495] text-sm italic text-center leading-relaxed max-w-sm">
          "{quote}"
        </p>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-[#849495] text-[11px] uppercase tracking-widest">Press ESC to minimize</span>
      </div>
    </div>
  );
}
