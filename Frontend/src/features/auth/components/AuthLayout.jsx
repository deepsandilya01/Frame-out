import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

import { FrameOutLogo } from '../../../components/FrameOutLogo';


// ─── Auth Layout ─────────────────────────────────────────────────────────────
const AuthLayout = ({ quote, quoteAuthor = '— Marcus Aurelius', children }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, { x: -24, opacity: 0, duration: 0.9, ease: 'power3.out' });
      gsap.from(rightRef.current, { x: 24, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
      gsap.from('.auth-form-el', {
        y: 14, opacity: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.3,
      });
    });
    return () => ctx.revert();
  }, []);

  const lines = (quote || 'Discipline\ncreates freedom.').split('\n');

  return (
    <div className="min-h-screen min-h-[100svh] flex" style={{ background: '#080808' }}>

      {/* ── LEFT — Quote Panel (lg+) ─────────────────────────────────────── */}
      <div
        ref={leftRef}
        className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between p-10 xl:p-16 overflow-hidden flex-shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Ambient orbs */}
        <div className="glow-orb" style={{
          width: '480px', height: '480px',
          background: 'var(--theme-accent-glow, rgba(0,245,255,0.1))',
          top: '-20%', left: '-20%', opacity: 0.7,
        }} />
        <div className="glow-orb" style={{
          width: '280px', height: '280px',
          background: 'rgba(100,60,180,0.08)', bottom: '-10%', right: '-5%',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <FrameOutLogo className="text-white/50" size={24} />
          <span className="text-[13px] font-medium text-white/25 tracking-tight">Frame-Out</span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="label-eyebrow mb-6 xl:mb-8" style={{ fontSize: '10px' }}>Frame-Out</div>
          <blockquote>
            <p
              className="text-white font-extrabold leading-none mb-2"
              style={{ fontSize: 'clamp(40px, 4.5vw, 72px)', letterSpacing: '-0.04em', lineHeight: 0.92 }}
            >
              {lines[0]}
            </p>
            {lines[1] && (
              <p
                className="text-white/35 font-light italic"
                style={{
                  fontSize: 'clamp(26px, 3vw, 48px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.95,
                  paddingLeft: '8%',
                }}
              >
                {lines[1]}
              </p>
            )}
          </blockquote>
          <p className="text-white/18 text-xs mt-6 xl:mt-8 tracking-wide">{quoteAuthor}</p>
        </div>

        {/* Badge */}
        <div className="relative z-10">
          <div className="pill" style={{ display: 'inline-flex', fontSize: '11px' }}>
            <span style={{ color: 'var(--theme-accent, #00F5FF)', marginRight: '6px' }}>●</span>
            Join 2,400+ deep thinkers
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form Panel ────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto"
        style={{ padding: 'clamp(80px, 10vh, 120px) clamp(16px, 5vw, 48px) clamp(32px, 5vh, 64px)' }}
      >
        {/* Mobile logo — only visible < lg */}
        <div className="lg:hidden absolute top-4 left-4 flex items-center gap-2">
          <FrameOutLogo className="text-white/70" size={22} />
          <span className="text-[13px] font-semibold text-white/50">Frame-Out</span>
        </div>

        <div className="w-full space-y-6 sm:space-y-8" style={{ maxWidth: 'min(400px, 100%)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
