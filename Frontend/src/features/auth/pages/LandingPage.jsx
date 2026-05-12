import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

import { FrameOutLogo } from '../../../components/FrameOutLogo';


// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 20) {
        navRef.current.style.background = 'rgba(8,8,8,0.95)';
        navRef.current.style.borderBottomColor = 'rgba(255,255,255,0.08)';
      } else {
        navRef.current.style.background = menuOpen ? 'rgba(8,8,8,0.98)' : 'transparent';
        navRef.current.style.borderBottomColor = 'transparent';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const navLinks = ['Features', 'Analytics', 'AI Coach', 'Focus Mode', 'Gamification', 'Smart Tools'];

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid transparent' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 text-accent">
          <FrameOutLogo size={26} className="text-white group-hover:text-accent transition-colors duration-300" />
          <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-white/90">Frame-Out</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[13px] font-medium text-white/40 hover:text-white/90 tracking-wide transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link to="/login" className="text-[13px] font-medium text-white/50 hover:text-white/90 transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-[13px] py-2 px-4 lg:py-2.5 lg:px-5">Start Free</Link>
        </div>

        {/* Mobile: Sign in + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/login" className="text-[12px] text-white/50 hover:text-white/90 transition-colors">Sign in</Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div
          id="mobile-nav-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-t px-4 py-6 space-y-4"
          style={{ background: 'rgba(8,8,8,0.98)', borderTopColor: 'rgba(255,255,255,0.06)' }}
        >
          {navLinks.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMenuOpen(false)}
              className="block text-[14px] font-medium text-white/50 hover:text-white py-2 transition-colors">
              {item}
            </a>
          ))}
          <div className="pt-2 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              className="btn-primary w-full justify-center py-3 text-[14px] block text-center mt-2">
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ─── Dashboard Preview ────────────────────────────────────────────────────────
const DashboardPreview = () => (
  <div className="relative w-full">
    {/* Glow */}
    <div className="glow-orb" style={{
      width: '300px', height: '300px',
      background: 'var(--theme-accent-glow, rgba(0,245,255,0.12))',
      top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(80px)',
    }} />
    {/* Card */}
    <div className="glass relative rounded-2xl p-1 z-10">
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(13,21,21,0.95)' }}>
        {/* Header bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-accent)', opacity: 0.5 }} />
          <span className="ml-2 text-[10px] text-white/20 font-mono">frame-out.app</span>
        </div>
        <div className="p-3 sm:p-4 grid grid-cols-5 gap-2 sm:gap-2.5">
          {/* Left — Timer */}
          <div className="col-span-2 space-y-2">
            <div className="glass rounded-xl p-2.5 sm:p-3 flex flex-col items-center">
              <span className="label-eyebrow mb-1.5" style={{ fontSize: '8px' }}>DEEP FOCUS</span>
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--theme-accent, #00F5FF)"
                    strokeWidth="5" strokeLinecap="round" strokeDasharray="213.6" strokeDashoffset="53.4"
                    style={{ filter: 'drop-shadow(0 0 6px var(--theme-accent, #00F5FF))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white leading-none">24:33</span>
                  <span className="text-[7px] sm:text-[8px] text-white/30 mt-0.5">remaining</span>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-2 sm:p-2.5">
              <div className="text-[7px] sm:text-[8px] text-white/30 uppercase tracking-widest mb-1">Streak</div>
              <div className="text-base sm:text-xl font-bold text-white">12<span className="text-[10px] font-normal text-white/30 ml-1">days</span></div>
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({length: 7}).map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{
                    background: i < 5 ? 'var(--theme-accent, #00F5FF)' : 'rgba(255,255,255,0.08)',
                    opacity: i < 5 ? (0.5 + i * 0.1) : 1,
                  }} />
                ))}
              </div>
            </div>
          </div>
          {/* Right — Stats */}
          <div className="col-span-3 space-y-2">
            <div className="glass rounded-xl p-2.5 sm:p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] sm:text-[9px] text-white/30 uppercase tracking-widest">Productivity</span>
                <span className="text-accent font-bold text-sm sm:text-base">94%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: '94%', background: 'var(--theme-accent)', boxShadow: '0 0 8px var(--theme-accent)' }} />
              </div>
            </div>
            <div className="rounded-xl p-2.5 sm:p-3" style={{
              background: 'var(--theme-accent-dim, rgba(0,245,255,0.06))',
              border: '1px solid var(--theme-accent-border, rgba(0,245,255,0.2))',
            }}>
              <div className="flex items-start gap-1.5">
                <span className="text-xs leading-none">⚡</span>
                <div>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-accent mb-0.5">AI INSIGHT</div>
                  <div className="text-[9px] sm:text-[10px] text-white/60 leading-relaxed">Peak focus: 9–11am.</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-2 sm:p-2.5">
              <div className="text-[7px] sm:text-[8px] text-white/30 uppercase tracking-widest mb-1.5">Focus Map</div>
              <div className="grid grid-cols-7 gap-0.5">
                {[0.8,0.3,0.9,0.2,0.7,0.1,0.6,0.4,0.8,0.2,0.5,0.9,0.3,0.7,0.6,0.1,0.8,0.4,0.9,0.2,0.7,0.5,0.3,0.8,0.6,0.1,0.9,0.4].map((intensity, i) => (
                  <div key={i} className="aspect-square rounded-sm" style={{
                    background: intensity > 0.6 ? 'var(--theme-accent, #00F5FF)' : intensity > 0.3 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    opacity: intensity > 0.6 ? intensity : 1,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Features data ────────────────────────────────────────────────────────────
const features = [
  { icon: '⚡', title: 'AI Coach', desc: 'Predictive burnout detection and personalized schedule optimization using neural focus patterns.' },
  { icon: '🌌', title: 'Deep Work Mode', desc: 'Immersive blackout environment with AI-powered tab blocking and focus-frequency sounds.' },
  { icon: '📊', title: 'Focus Analytics', desc: 'Surgical precision tracking of your cognitive energy and attention distribution throughout the day.' },
  { icon: '✅', title: 'Smart Todo', desc: 'Dynamic task prioritization based on your current energy levels and long-term momentum goals.' },
  { icon: '🧬', title: 'Dopamine Tracking', desc: 'Quantify your focus sessions and rewire your reward circuits for long-term sustainable productivity.' },
  { icon: '🛡️', title: 'Website Blocking', desc: 'Zero-compromise boundaries that evolve as you work, keeping distractions completely out of sight.' },
];

// ─── Theme Switcher ───────────────────────────────────────────────────────────
const themes = [
  { key: 'cyan',    color: '#00F5FF', label: 'Electric Blue' },
  { key: 'emerald', color: '#10b981', label: 'Emerald' },
  { key: 'crimson', color: '#ef4444', label: 'Crimson' },
  { key: 'purple',  color: '#a855f7', label: 'Purple' },
  { key: 'orange',  color: '#f97316', label: 'Orange' },
  { key: 'arctic',  color: '#e2e8f0', label: 'Arctic' },
];

const ThemeSwitcher = () => {
  const [active, setActive] = useState('cyan');
  const switchTheme = (key) => {
    setActive(key);
    document.documentElement.setAttribute('data-theme', key === 'cyan' ? '' : key);
  };
  return (
    <div className="fixed z-50 glass rounded-full p-2.5 flex flex-col gap-2"
      style={{ bottom: '24px', left: '24px' }}>
      {themes.map((t) => (
        <button key={t.key} title={t.label} onClick={() => switchTheme(t.key)}
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 hover:scale-125"
          style={{
            background: t.color,
            boxShadow: active === t.key ? `0 0 10px ${t.color}` : 'none',
            opacity: active === t.key ? 1 : 0.35,
            outline: active === t.key ? `2px solid ${t.color}` : 'none',
            outlineOffset: '2px',
          }}
        />
      ))}
    </div>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const heroRef = useRef(null);
  const dashRef = useRef(null);
  const featsRef = useRef(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hero-h1', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.25 });
      gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      gsap.from('.hero-ctas', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 });
      gsap.from('.hero-pills', { y: 12, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.7 });
      gsap.from('.hero-dashboard', { x: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.35 });
      if (dashRef.current) {
        gsap.to(dashRef.current, { y: '-=10', duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
      gsap.from('.feat-card', {
        scrollTrigger: { trigger: featsRef.current, start: 'top 80%' },
        y: 28, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} style={{ background: '#080808', minHeight: '100vh' }}>
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:font-bold focus:rounded-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <ThemeSwitcher />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="main-content"
        aria-label="Hero section"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center lg:min-h-[100svh]"
        style={{
          paddingTop: 'clamp(70px, 10vh, 120px)',
          paddingBottom: '20px',
          gap: '24px',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 640px) {
            section.relative {
              padding-bottom: clamp(40px, 6vh, 80px) !important;
              gap: clamp(32px, 5vw, 72px) !important;
            }
          }
        `}} />
        {/* Glow orbs */}
        <div className="glow-orb" style={{ width: 'min(500px, 60vw)', height: 'min(500px, 60vw)', background: 'var(--theme-accent-glow)', top: '-10%', left: '-10%', opacity: 0.45 }} />
        <div className="glow-orb" style={{ width: '300px', height: '300px', background: 'rgba(100,60,200,0.07)', bottom: '0', right: '20%' }} />

        {/* Left — Text */}
        <div className="w-full lg:w-[52%] space-y-5 sm:space-y-6 relative z-10 text-center lg:text-left">
          <div className="hero-eyebrow flex items-center gap-2 justify-center lg:justify-start">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="label-eyebrow">Deep Work OS</span>
          </div>

          <h1
            className="hero-h1 font-extrabold text-white leading-none"
            style={{ fontSize: 'clamp(32px, 6vw, 80px)', letterSpacing: '-0.04em', lineHeight: 0.95 }}
          >
            Escape Digital<br />
            Chaos.<br />
            <span style={{ color: 'var(--theme-accent, #00F5FF)' }}>Master Deep<br className="sm:hidden" /> Focus.</span>
          </h1>

          <p className="hero-sub text-white/40 leading-relaxed font-normal mx-auto lg:mx-0"
            style={{ fontSize: 'clamp(13px, 1.3vw, 17px)', maxWidth: '420px' }}>
            Frame-Out helps students, creators, and developers eliminate distractions and build real discipline using AI-powered productivity systems.
          </p>

          <div className="hero-ctas flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link to="/register" className="btn-primary" style={{ fontSize: 'clamp(12px, 1vw, 14px)' }}>
              Start Focusing
            </Link>
            <a 
              href="https://github.com/deepsandilya01/Frame-out/tree/main/Extension"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-2" 
              style={{ fontSize: 'clamp(12px, 1vw, 14px)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Get Extension
            </a>
          </div>

          <div className="hero-pills flex flex-wrap gap-2 justify-center lg:justify-start">
            {['⚡ AI Coach', '🎯 Focus Mode', '📊 Analytics', '🛡️ Site Blocking'].map((tag) => (
              <span key={tag} className="pill" style={{ fontSize: '11px' }}>{tag}</span>
            ))}
          </div>

          <p className="text-center lg:text-left" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
            2,400+ deep thinkers • No credit card • Cancel anytime
          </p>
        </div>

        {/* Right — Dashboard (hidden on mobile < sm) */}
        <div
          ref={dashRef}
          className="hero-dashboard hidden sm:flex w-full lg:w-auto flex-1 justify-center items-center relative z-10"
          style={{ minWidth: 0 }}
        >
          <div style={{ width: '100%', maxWidth: 'min(440px, 42vw)', minWidth: '280px' }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── MOBILE DASHBOARD (shown only on xs screens, below hero text) ── */}
      <div className="sm:hidden px-4 pb-12" style={{ background: '#080808' }}>
        <div className="max-w-sm mx-auto opacity-80">
          <DashboardPreview />
        </div>
      </div>

      {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
      <div className="divider-laser mx-4 sm:mx-6 lg:mx-8" />

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" ref={featsRef} className="py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-16 max-w-xl text-center sm:text-left mx-auto sm:mx-0">
          <div className="label-eyebrow mb-3 sm:mb-4">Capabilities</div>
          <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
            The ultimate toolset<br />for deep work.
          </h2>
          <p className="text-white/35 mt-3 sm:mt-4 leading-relaxed" style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}>
            Everything you need to block the noise and protect your most valuable resource — your attention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feat, i) => (
            <div key={i} className="feat-card glass rounded-2xl p-5 sm:p-6 hover-lift cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl mb-4 sm:mb-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {feat.icon}
              </div>
              <h3 className="font-semibold text-white/90 mb-1.5 sm:mb-2" style={{ fontSize: 'clamp(13px, 1.1vw, 15px)' }}>{feat.title}</h3>
              <p className="text-white/35 leading-relaxed" style={{ fontSize: 'clamp(12px, 0.9vw, 13px)' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANALYTICS SECTION ───────────────────────────────────────────── */}
      <section id="analytics" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="label-eyebrow">Deep Analytics</div>
            <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
              Understand your attention<br /><span className="text-accent">patterns.</span>
            </h2>
            <p className="text-white/35 leading-relaxed" style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}>
              Stop guessing and start measuring. Frame-Out tracks every second of your focus and distraction, giving you a detailed breakdown of where your day went.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                'Real-time Heatmaps of your productivity peaks',
                'Detailed breakdown of distracting websites',
                'Weekly comparisons to track your growth',
                'Mood-to-productivity correlation tracking'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/50 text-[13px] sm:text-[14px]">
                  <div className="w-4 h-4 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full lg:w-1/2 glass rounded-3xl p-6 sm:p-8 relative">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-glow rounded-full filter blur-[60px] opacity-30" />
             {/* Mock Analytics UI */}
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                      <div className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Weekly Focus</div>
                      <div className="text-2xl font-bold text-white">42.5<span className="text-sm font-normal text-white/30 ml-1">hrs</span></div>
                   </div>
                   <div className="flex gap-1.5 items-end h-24">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                         <div key={i} className="w-4 sm:w-6 bg-accent/20 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                            <div className="absolute bottom-0 left-0 w-full bg-accent transition-all duration-700" style={{ height: '70%' }} />
                         </div>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="text-[9px] text-white/20 uppercase mb-1">Peak Time</div>
                      <div className="text-sm font-semibold text-white">10:30 AM</div>
                   </div>
                   <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="text-[9px] text-white/20 uppercase mb-1">Focus Score</div>
                      <div className="text-sm font-semibold text-accent">A+</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── AI COACH SECTION ────────────────────────────────────────────── */}
      <section id="ai-coach" className="py-16 sm:py-20 lg:py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-12 sm:gap-20">
          <div className="w-full lg:w-1/2">
             <div className="glass-strong rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                   </div>
                   <div>
                      <div className="text-white font-bold">AI Coach Alpha</div>
                      <div className="text-[10px] text-accent font-semibold tracking-widest uppercase">System Online</div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 text-[13px] text-white/70 leading-relaxed italic">
                      "I've noticed your focus dips every Tuesday at 3 PM. I recommend scheduling your shallow work then and moving deep work to your 10 AM peak window."
                   </div>
                   <div className="flex gap-2">
                      <div className="pill pill-accent text-[10px]">Optimized Schedule</div>
                      <div className="pill text-[10px]">Burnout Warning</div>
                   </div>
                </div>
             </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="label-eyebrow">Personalized Guidance</div>
            <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
              An AI that actually<br /><span className="text-accent">knows you.</span>
            </h2>
            <p className="text-white/35 leading-relaxed" style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}>
              Frame-Out's AI Coach doesn't just show data; it understands your habits. It detects burnout before you do and suggests the optimal times for you to tackle your hardest tasks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
               <div>
                  <h4 className="text-white font-semibold mb-2">Burnout Detection</h4>
                  <p className="text-white/30 text-xs">Identifies fatigue patterns and suggests mandatory breaks.</p>
               </div>
               <div>
                  <h4 className="text-white font-semibold mb-2">Adaptive Timer</h4>
                  <p className="text-white/30 text-xs">Adjusts Pomodoro lengths based on your current focus levels.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOCUS MODE SECTION ──────────────────────────────────────────── */}
      <section id="focus-mode" className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="label-eyebrow mb-4">The core experience</div>
          <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
            Pure, unadulterated<br /><span className="text-accent">concentration.</span>
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass rounded-3xl p-8 hover-lift border-accent/20">
              <h3 className="text-xl font-bold text-white mb-4">Deep Work Mode</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                 Activate the blackout. Our Chrome extension shuts down distracting tabs and notifications, leaving only you and your work.
              </p>
              <div className="flex items-center gap-2 text-accent text-[11px] font-bold tracking-widest uppercase">
                 <span>Active Blocking</span>
                 <div className="w-1 h-1 rounded-full bg-accent" />
                 <span>Zero Distraction</span>
              </div>
           </div>
           <div className="glass rounded-3xl p-8 hover-lift">
              <h3 className="text-xl font-bold text-white mb-4">Pomodoro Flow</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                 Built-in concentration sounds, breathing exercises, and gamified XP rewards to keep you in the zone for longer.
              </p>
              <div className="flex items-center gap-2 text-white/30 text-[11px] font-bold tracking-widest uppercase">
                 <span>XP Rewards</span>
                 <div className="w-1 h-1 rounded-full bg-white/10" />
                 <span>Level Up Stats</span>
              </div>
           </div>
        </div>
      </section>

      {/* ── GAMIFICATION SECTION ─────────────────────────────────────────── */}
      <section id="gamification" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="label-eyebrow">Level Up Your Focus</div>
            <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
              Work feels like a game.<br /><span className="text-accent">Success feels like winning.</span>
            </h2>
            <p className="text-white/35 leading-relaxed" style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}>
              Frame-Out transforms boring tasks into epic quests. Earn XP for every focused second, complete daily missions to maintain your streak, and level up your productivity profile.
            </p>
            <div className="space-y-4 pt-4">
               {[
                 { title: 'XP Rewards', desc: 'Earn points for deep work sessions and clean streaks.' },
                 { title: 'Daily Missions', desc: 'AI-generated challenges tailored to your goals.' },
                 { title: 'Global Leaderboards', desc: 'Compete with the top 1% of deep thinkers.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                       +{250 + i*50}
                    </div>
                    <div>
                       <div className="text-white font-semibold text-sm">{item.title}</div>
                       <div className="text-white/30 text-xs">{item.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2">
             <div className="glass rounded-3xl p-6 sm:p-10 border-accent/20 relative">
                {/* Mock Level UI */}
                <div className="flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-full border-4 border-accent/20 p-1 mb-4 relative">
                      <div className="w-full h-full rounded-full bg-accent/10 flex items-center justify-center">
                         <span className="text-3xl font-black text-accent">Lvl 12</span>
                      </div>
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                         <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent)" strokeWidth="4" strokeDasharray="276" strokeDashoffset="80" strokeLinecap="round" />
                      </svg>
                   </div>
                   <div className="text-white font-bold text-lg mb-1">Deep Thinker</div>
                   <div className="text-white/30 text-xs mb-6 uppercase tracking-widest">Master of focus</div>
                   
                   <div className="w-full space-y-3">
                      <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
                         <span>Next Rank: Architect</span>
                         <span>2,450 / 3,000 XP</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-accent" style={{ width: '80%' }} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── SMART TODO & BLOCKER SECTION ─────────────────────────────────── */}
      <section id="smart-tools" className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20">
              <div className="glass rounded-3xl p-8 hover-lift">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 text-xl">✅</div>
                 <h3 className="text-2xl font-bold text-white mb-4">Smart Todo List</h3>
                 <p className="text-white/40 text-sm leading-relaxed mb-8">
                    Not just a checklist. Our AI prioritizes your tasks based on your energy patterns and urgency, ensuring you tackle the hardest things when your focus is at its peak.
                 </p>
                 <div className="space-y-3">
                    {['Priority Ranking', 'Energy Estimation', 'Goal Alignment'].map(tag => (
                       <div key={tag} className="inline-flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60 font-medium">
                          <div className="w-1 h-1 rounded-full bg-accent" /> {tag}
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="glass rounded-3xl p-8 hover-lift border-accent/10">
                 <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20 text-xl text-accent">🛡️</div>
                 <h3 className="text-2xl font-bold text-white mb-4">Website Blocker</h3>
                 <p className="text-white/40 text-sm leading-relaxed mb-8">
                    The ultimate shield. Our browser extension automatically detects when you're "doom-scrolling" and redirects you back to your mission.
                 </p>
                 <div className="space-y-3">
                    {['YouTube Shorts Removal', 'Infinite Scroll Block', 'Custom Whitelists'].map(tag => (
                       <div key={tag} className="inline-flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/10 text-[10px] text-accent font-medium">
                          <div className="w-1 h-1 rounded-full bg-accent" /> {tag}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section id="community" className="py-16 sm:py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="label-eyebrow mb-4">Deep Thinkers</div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">Loved by high-performers.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Alex Rivera', role: 'Software Engineer', quote: 'Frame-Out changed how I code. The AI coach is like having a productivity mentor by my side.' },
              { name: 'Sarah Chen', role: 'Product Designer', desc: 'Focus Mode is absolute magic. I finally reclaimed my deep work hours from the noise.' },
              { name: 'James Wilson', role: 'Student', desc: 'The site blocking is ruthless. Exactly what I needed to finish my thesis without distractions.' }
            ].map((t, i) => (
              <div key={i} className="glass p-8 rounded-3xl space-y-4 hover-lift border-white/5">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => <span key={star} className="text-accent text-xs">★</span>)}
                </div>
                <p className="text-white/50 text-sm leading-relaxed italic">"{t.quote || t.desc}"</p>
                <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white text-[13px] font-semibold">{t.name}</div>
                    <div className="text-white/20 text-[11px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY SECTION ───────────────────────────────────────────── */}
      <section id="our-story" className="py-16 sm:py-20 lg:py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="glass-strong rounded-[2.5rem] p-8 sm:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent rounded-full filter blur-[120px]" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="space-y-6">
                    <div className="label-eyebrow">The ADAPTrix Vision</div>
                    <h2 className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 56px)', letterSpacing: '-0.04em' }}>
                       Built for the <br /><span className="text-accent italic">Deep Thinkers.</span>
                    </h2>
                    <p className="text-white/40 leading-relaxed text-sm sm:text-base">
                       Frame-Out was born from a simple observation: the digital world is designed to steal our attention. We believe that focus is a superpower, and in an age of infinite distraction, the person who can master their mind wins.
                    </p>
                    <p className="text-white/40 leading-relaxed text-sm sm:text-base">
                       Our team, <span className="text-white font-semibold">ADAPTrix</span>, set out to build more than just a productivity app. We're building a digital sanctuary—an operating system for your most valuable work.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                             <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080808] bg-white/5 flex items-center justify-center text-[10px] text-white/20 font-bold">
                                A{i}
                             </div>
                          ))}
                       </div>
                       <div className="text-[11px] text-white/30 uppercase tracking-widest font-medium">The ADAPTrix Engineering Team</div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { label: 'Founded', val: '2026' },
                       { label: 'Mission', val: 'Focus' },
                       { label: 'Team', val: 'ADAPTrix' },
                       { label: 'Goal', val: 'Deep Work' }
                    ].map((s, i) => (
                       <div key={i} className="glass p-6 rounded-2xl text-center hover-lift">
                          <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-2">{s.label}</div>
                          <div className="text-lg font-bold text-white">{s.val}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-8 sm:p-12"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="label-eyebrow mb-3 sm:mb-4">Start Today</div>
          <h2 className="font-extrabold text-white mb-3 sm:mb-4 leading-tight"
            style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
            Your best work<br />starts here.
          </h2>
          <p className="text-white/35 mb-6 sm:mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', maxWidth: '480px' }}>
            Join thousands of deep thinkers who've reclaimed their focus and built real momentum.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary justify-center py-3 sm:py-3.5 px-6 sm:px-8 text-[14px]">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-ghost justify-center py-3 sm:py-3.5 px-6 text-[13px]">
              Sign In
            </Link>
          </div>
          <p className="mt-5 sm:mt-6" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>


      {/* Back to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-accent hover:border-accent transition-all duration-300 group opacity-0 animate-fade-in"
        style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Top footer grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand column — spans 2 cols on lg */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-2 space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <FrameOutLogo size={26} className="text-white" />
                <span className="text-[15px] font-semibold text-white/90 tracking-tight">Frame-Out</span>
              </div>

              <p className="text-white/35 leading-relaxed" style={{ fontSize: '13px', maxWidth: '280px' }}>
                The deep work operating system for students, creators, and developers who refuse to settle for distraction.
              </p>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  All systems operational
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { label: 'Twitter/X', href: 'https://x.com/SandilyaDe12434', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.258 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )},
                  { label: 'GitHub', href: 'https://github.com/deepsandilya01', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )},
                  { label: 'Discord', href: 'https://discord.com/users/deepsandilya01', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                  )},
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/deepsandilya01', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )},
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} aria-label={label}
                    target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">Product</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Features', href: '#features', desc: 'Core deep work tools' },
                  { label: 'AI Coach', href: '#ai-coach', desc: 'Neural habit optimization' },
                  { label: 'Focus Mode', href: '#focus-mode', desc: 'Zero distraction environment' },
                  { label: 'Gamification', href: '#gamification', desc: 'Work feels like a game' },
                  { label: 'Smart Tools', href: '#smart-tools', desc: 'Todo & Website Blocker' },
                  { label: 'Analytics', href: '#analytics', desc: 'Data-driven insights' },
                ].map(({ label, href, desc }) => (
                  <li key={label}>
                    <a href={href} className="group block">
                      <div className="text-[13px] text-white/40 group-hover:text-white/90 transition-colors">{label}</div>
                      <div className="text-[10px] text-white/20 font-light mt-0.5">{desc}</div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">Company</h4>
              <ul className="space-y-4">
                {[
                  { label: 'About Us', href: '#our-story', desc: 'Our mission for focus' },
                  { label: 'ADAPTrix Team', to: '/team', desc: 'The minds behind Frame-Out' },
                  { label: 'Contact', href: 'mailto:support@frameout.app', desc: 'Get in touch with us' },
                ].map(({ label, href, to, desc }) => (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className="group block">
                        <div className="text-[13px] text-white/40 group-hover:text-white/90 transition-colors">
                          {label === 'ADAPTrix Team' ? <><span className="animate-brand mr-1">ADAPTrix</span> Team</> : label}
                        </div>
                        <div className="text-[10px] text-white/20 font-light mt-0.5">{desc}</div>
                      </Link>
                    ) : (
                      <a href={href} className="group block">
                        <div className="text-[13px] text-white/40 group-hover:text-white/90 transition-colors">
                          {label === 'ADAPTrix Team' ? <><span className="animate-brand mr-1">ADAPTrix</span> Team</> : label}
                        </div>
                        <div className="text-[10px] text-white/20 font-light mt-0.5">{desc}</div>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">Resources</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Documentation', href: 'https://github.com/deepsandilya01/Frame-out/blob/main/README.md', desc: 'User guides & API' },
                  { label: 'Community', href: '#community', desc: 'Join 2,400+ deep thinkers' },
                  { label: 'Status', href: '#', desc: 'All systems operational' },
                ].map(({ label, href, desc }) => (
                  <li key={label}>
                    <a href={href} 
                       target={href.startsWith('http') ? '_blank' : '_self'}
                       rel="noopener noreferrer"
                       className="group block">
                      <div className="text-[13px] text-white/40 group-hover:text-white/90 transition-colors">{label}</div>
                      <div className="text-[10px] text-white/20 font-light mt-0.5 flex items-center gap-1.5">
                        {label === 'Status' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {desc}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-sm">
                <h4 className="text-[14px] font-semibold text-white/80 mb-1">Stay in the loop.</h4>
                <p className="text-[12px] text-white/30 leading-relaxed">
                  Weekly insights on deep work, productivity science, and Frame-Out updates.
                </p>
              </div>
              {subscribed ? (
                <div className="bg-accent/5 border border-accent/20 rounded-2xl px-6 py-5 animate-fade-in relative overflow-hidden group">
                  <div className="glow-orb" style={{ width: '100px', height: '100px', background: 'var(--theme-accent-glow)', top: '-20%', right: '-10%', opacity: 0.3 }} />
                  <div className="relative z-10">
                    <div className="text-accent text-[14px] font-bold italic mb-1">Welcome to the inner circle. 🚀</div>
                    <p className="text-white/40 text-[11px] mb-4">You've just unlocked the "Deep Work Manifesto".</p>
                    <a 
                      href="https://github.com/deepsandilya01/Frame-out/blob/main/README.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-white hover:text-accent transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download Manifesto (PDF)
                    </a>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
                  className="flex gap-2 w-full md:w-auto"
                  style={{ maxWidth: '380px' }}
                >
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="flex-1 text-[13px] text-white/70 placeholder-white/20 bg-transparent outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minWidth: 0,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--theme-accent, #00F5FF)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="submit"
                    className="btn-primary flex-shrink-0 text-[12px] py-2.5 px-4"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
               <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em' }}>
                 © 2026 Frame-Out Technologies. Made with <span className="text-accent animate-pulse inline-block mx-0.5">❤️</span> by <span className="animate-brand ml-1">ADAPTrix</span>.
               </p>
               <div className="h-3 w-[1px] bg-white/5 hidden sm:block" />
               <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hackathon Edition</span>
               </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3">
              {[
                { label: 'Privacy', path: '/legal/privacy' },
                { label: 'Terms', path: '/legal/terms' },
                { label: 'Cookies', path: '/legal/cookies' },
                { label: 'Security', path: '/legal/security' }
              ].map((l) => (
                <Link key={l.label} to={l.path}
                  className="text-[11px] text-white/20 hover:text-white/60 transition-colors duration-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
