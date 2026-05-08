import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const COLORS = ['#00F5FF', '#a855f7', '#f59e0b', '#10b981', '#f97316', '#fff'];

function Particle({ x, y, color, size }) {
  return (
    <div className="particle" style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      background: color,
      pointerEvents: 'none',
    }} />
  );
}

export default function XPCelebration({ xp, level, isLevelUp, badges = [], onDone }) {
  const overlayRef  = useRef(null);
  const cardRef     = useRef(null);
  const xpRef       = useRef(null);
  const particlesRef= useRef([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles
    const pts = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
    }));
    setParticles(pts);

    // Entrance animation
    const tl = gsap.timeline({ onComplete: () => setTimeout(onDone, 400) });

    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    )
    .fromTo(cardRef.current,
      { scale: 0.5, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' },
      '-=0.1'
    )
    .fromTo(xpRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' },
      '-=0.2'
    );

    // Animate particles after a tiny delay
    const timer = setTimeout(() => {
      particlesRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 1, y: 0 },
          {
            y: -(Math.random() * 300 + 100),
            x: (Math.random() - 0.5) * 200,
            opacity: 0,
            rotation: Math.random() * 720 - 360,
            duration: Math.random() * 1.5 + 1,
            delay: Math.random() * 0.5,
            ease: 'power2.out',
          }
        );
      });
    }, 200);

    // Auto close after 4s
    const closeTimer = setTimeout(() => {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, onComplete: onDone });
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={onDone}
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', cursor: 'pointer' }}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={p.id}
            ref={el => particlesRef.current[i] = el}
            style={{
              position: 'absolute',
              left: p.x, top: p.y,
              width: p.size, height: p.size,
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              background: p.color,
              opacity: 1,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div ref={cardRef} className="glass-strong rounded-3xl p-10 flex flex-col items-center text-center max-w-sm w-full mx-4"
           style={{ border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 60px rgba(0,245,255,0.15)' }}>

        {/* Emoji */}
        <div className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.5))' }}>
          {isLevelUp ? '🚀' : '⚡'}
        </div>

        {/* XP badge */}
        <div ref={xpRef}
             className="text-5xl font-black mb-2 tabular-nums"
             style={{ color: '#00F5FF', textShadow: '0 0 30px rgba(0,245,255,0.6)' }}>
          +{xp} XP
        </div>

        {isLevelUp && (
          <div className="mb-3">
            <div className="text-2xl font-bold text-white mb-1">Level Up! 🎊</div>
            <div className="pill-accent text-sm px-4 py-1.5">Now Level {level}</div>
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-3 space-y-2 w-full">
            {badges.map((b, i) => (
              <div key={i} className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">🏅</span>
                <div className="text-left">
                  <p className="text-amber-400 font-semibold text-sm">New Badge!</p>
                  <p className="text-[#dce4e4] text-xs">{b}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[#849495] text-xs mt-6">Click anywhere to continue</p>
      </div>

      {/* Glow pulse */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(circle at 50% 50%, rgba(0,245,255,0.08), transparent 60%)',
             animation: 'pulse 1s ease-in-out infinite alternate',
           }} />
    </div>
  );
}
