import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Wind, RefreshCw } from 'lucide-react';

const EXERCISES = {
  '4-7-8': { phases: [{ label: 'Inhale', s: 4 }, { label: 'Hold', s: 7 }, { label: 'Exhale', s: 8 }], color: '#00F5FF', name: '4-7-8 Calm' },
  'box':   { phases: [{ label: 'Inhale', s: 4 }, { label: 'Hold', s: 4 }, { label: 'Exhale', s: 4 }, { label: 'Hold', s: 4 }], color: '#a855f7', name: 'Box Breathing' },
  'deep':  { phases: [{ label: 'Inhale', s: 5 }, { label: 'Exhale', s: 5 }], color: '#10b981', name: 'Deep Breath' },
};

export default function BreathingWidget({ onClose }) {
  const circleRef  = useRef(null);
  const labelRef   = useRef(null);
  const containerRef = useRef(null);
  const tlRef      = useRef(null);

  const [type,    setType]    = useState('4-7-8');
  const [phase,   setPhase]   = useState(0);
  const [counter, setCounter] = useState(0);
  const [rounds,  setRounds]  = useState(0);
  const [active,  setActive]  = useState(false);
  const intervalRef = useRef(null);
  const phaseRef    = useRef(0);
  const counterRef  = useRef(0);

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }, []);

  const ex = EXERCISES[type];

  const runPhase = (phaseIdx) => {
    const p = ex.phases[phaseIdx];
    setPhase(phaseIdx);
    setCounter(p.s);
    counterRef.current = p.s;
    phaseRef.current   = phaseIdx;

    // Animate the circle
    const isInhale  = p.label === 'Inhale';
    const isExhale  = p.label === 'Exhale';
    const isHold    = p.label === 'Hold';

    gsap.killTweensOf(circleRef.current);

    if (isInhale) {
      gsap.to(circleRef.current, { scale: 1.4, duration: p.s, ease: 'power1.inOut' });
    } else if (isExhale) {
      gsap.to(circleRef.current, { scale: 0.75, duration: p.s, ease: 'power1.inOut' });
    } else {
      gsap.to(circleRef.current, { scale: circleRef.current._gsap?.scale || 1, duration: 0.1 });
    }

    // Phase label animation
    gsap.fromTo(labelRef.current,
      { opacity: 0, y: -6 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
  };

  const start = () => {
    setActive(true);
    setRounds(0);
    runPhase(0);

    intervalRef.current = setInterval(() => {
      counterRef.current -= 1;
      setCounter(counterRef.current);

      if (counterRef.current <= 0) {
        const nextPhase = (phaseRef.current + 1) % ex.phases.length;
        if (nextPhase === 0) setRounds(r => r + 1);
        runPhase(nextPhase);
      }
    }, 1000);
  };

  const stop = () => {
    setActive(false);
    clearInterval(intervalRef.current);
    gsap.to(circleRef.current, { scale: 1, duration: 0.6, ease: 'power2.out' });
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Restart when type changes
  useEffect(() => {
    stop();
    setPhase(0);
    setCounter(0);
    setRounds(0);
    gsap.to(circleRef.current, { scale: 1, duration: 0.4 });
  }, [type]);

  const currentPhase = ex.phases[phase];
  const progressPct  = counter > 0 ? ((currentPhase?.s - counter) / currentPhase?.s) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
      <div ref={containerRef} className="glass-strong rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6">

        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-accent" />
            <span className="text-white font-semibold text-sm">Breathing Exercise</span>
          </div>
          <button onClick={onClose} className="text-[#849495] hover:text-white text-xs transition-all">✕ Close</button>
        </div>

        {/* Type selector */}
        <div className="flex gap-1 glass rounded-full p-1 w-full">
          {Object.entries(EXERCISES).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                type === k ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
              }`}>
              {v.name}
            </button>
          ))}
        </div>

        {/* Animated Circle */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full opacity-10"
               style={{ border: `2px solid ${ex.color}` }} />
          {/* Glow ring */}
          <div className="absolute inset-2 rounded-full opacity-5"
               style={{ background: ex.color }} />
          {/* Animated circle */}
          <div
            ref={circleRef}
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${ex.color}30, ${ex.color}08)`,
              border: `2px solid ${ex.color}60`,
              boxShadow: active ? `0 0 30px ${ex.color}40, 0 0 60px ${ex.color}15` : 'none',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            {/* Counter */}
            <span className="text-4xl font-bold tabular-nums" style={{ color: ex.color }}>
              {active ? counter : '·'}
            </span>
          </div>

          {/* Phase progress ring */}
          {active && (
            <svg className="absolute inset-0" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="92" fill="none"
                      stroke={ex.color} strokeWidth="2" opacity="0.15"
                      strokeDasharray={2 * Math.PI * 92} />
              <circle cx="100" cy="100" r="92" fill="none"
                      stroke={ex.color} strokeWidth="2" opacity="0.6"
                      strokeDasharray={2 * Math.PI * 92}
                      strokeDashoffset={2 * Math.PI * 92 * (1 - progressPct / 100)}
                      style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
          )}
        </div>

        {/* Phase label */}
        <div ref={labelRef} className="text-center">
          <p className="text-2xl font-bold text-white">{active ? currentPhase?.label : 'Ready'}</p>
          <p className="text-[#849495] text-sm mt-0.5">
            {active
              ? ex.phases.map(p => p.label).join(' · ')
              : `${ex.phases.map(p => `${p.label} ${p.s}s`).join(' · ')}`}
          </p>
        </div>

        {/* Rounds counter */}
        {active && rounds > 0 && (
          <div className="pill-accent text-xs px-3 py-1">✓ {rounds} round{rounds > 1 ? 's' : ''} complete</div>
        )}

        {/* Control button */}
        <button
          onClick={active ? stop : start}
          className={active ? 'btn-ghost px-8 py-3 w-full' : 'btn-primary px-8 py-3 w-full'}
        >
          {active ? <><RefreshCw size={14} /> Stop</> : <><Wind size={14} /> Start Breathing</>}
        </button>
      </div>
    </div>
  );
}
