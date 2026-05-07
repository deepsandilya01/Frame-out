import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Logo ─────────────────────────────────────────────────────────────────────
const FrameOutLogo = ({ className = '', size = 28 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="8" y="8" width="16" height="1.8" rx="0.9" fill="currentColor"/>
    <rect x="8" y="8" width="1.8" height="16" rx="0.9" fill="currentColor"/>
    <rect x="8" y="14.5" width="11" height="1.8" rx="0.9" fill="currentColor"/>
    <circle cx="23.5" cy="23.5" r="2.5" fill="var(--theme-accent, #00F5FF)"/>
  </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navLinks = ['Features', 'Analytics', 'AI Coach', 'Focus Mode'];

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
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div
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
  { icon: '⚡', title: 'AI Coach', desc: 'Personalized insights that adapt to your cognitive rhythm in real-time.' },
  { icon: '🌌', title: 'Deep Work Mode', desc: 'Total blackout environment — no pings, no interruptions, no compromise.' },
  { icon: '📊', title: 'Focus Analytics', desc: 'Visualize your attention patterns and reclaim lost productive hours.' },
  { icon: '✅', title: 'Smart Todo', desc: 'Tasks ranked by urgency, energy cost, and alignment with your goals.' },
  { icon: '🧬', title: 'Dopamine Tracking', desc: 'Understand your reward circuits and build sustainable work habits.' },
  { icon: '🛡️', title: 'Website Blocking', desc: 'AI-enforced boundaries that learn from your distraction patterns.' },
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
    <div className="fixed z-50 glass rounded-2xl p-2 flex flex-col gap-1.5"
      style={{ bottom: '16px', right: '12px' }}>
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
      <Navbar />
      <ThemeSwitcher />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center"
        style={{
          minHeight: '100svh',
          paddingTop: 'clamp(80px, 12vh, 120px)',
          paddingBottom: 'clamp(40px, 6vh, 80px)',
          gap: 'clamp(32px, 5vw, 72px)',
        }}
      >
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
            <button className="btn-ghost flex items-center gap-2" style={{ fontSize: 'clamp(12px, 1vw, 14px)' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm-1 10.5V3.5l5 3.5-5 3.5z"/>
              </svg>
              Watch Demo
            </button>
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
                  { label: 'Twitter/X', href: '#', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.258 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )},
                  { label: 'GitHub', href: '#', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )},
                  { label: 'Discord', href: '#', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                  )},
                  { label: 'LinkedIn', href: '#', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )},
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} aria-label={label}
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
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'AI Coach', href: '#ai-coach' },
                  { label: 'Focus Mode', href: '#focus-mode' },
                  { label: 'Analytics', href: '#analytics' },
                  { label: 'Site Blocking', href: '#' },
                  { label: 'Integrations', href: '#' },
                  { label: 'Changelog', href: '#', badge: 'New' },
                ].map(({ label, href, badge }) => (
                  <li key={label}>
                    <a href={href}
                      className="text-[13px] text-white/35 hover:text-white/80 transition-colors flex items-center gap-2">
                      {label}
                      {badge && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--theme-accent-dim)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent-border)' }}>
                          {badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Careers', href: '#'},
                  { label: 'Press Kit', href: '#' },
                  { label: 'Partners', href: '#' },
                  { label: 'Contact', href: '#' },
                ].map(({ label, href, badge }) => (
                  <li key={label}>
                    <a href={href}
                      className="text-[13px] text-white/35 hover:text-white/80 transition-colors flex items-center gap-2">
                      {label}
                      {badge && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                          {badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Documentation', href: '#' },
                  { label: 'API Reference', href: '#' },
                  { label: 'Help Center', href: '#' },
                  { label: 'Community', href: '#' },
                  { label: 'Roadmap', href: '#' },
                  { label: 'Status', href: '#' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-[13px] text-white/35 hover:text-white/80 transition-colors">
                      {label}
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
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 w-full md:w-auto"
                style={{ maxWidth: '380px' }}
              >
                <input
                  type="email"
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
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em' }}>
              © 2026 Frame-Out Technologies. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((l) => (
                <a key={l} href="#"
                  className="transition-colors"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
