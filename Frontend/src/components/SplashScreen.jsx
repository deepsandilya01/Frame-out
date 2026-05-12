import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FrameOutLogo } from './FrameOutLogo';

export default function SplashScreen({ onComplete }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const iconRef = useRef(null);
  const subtextRef = useRef(null);
  const progressRef = useRef(null);
  const percentRef = useRef(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Animation Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Final fade out after 20 seconds
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1,
          delay: 0.5,
          onComplete: onComplete
        });
      }
    });

    // Initial State
    gsap.set([iconRef.current, logoRef.current, subtextRef.current, progressRef.current], { 
      opacity: 0, 
      y: 20 
    });

    // Entrance sequence
    tl.to(iconRef.current, { 
      opacity: 1, 
      y: 0, 
      duration: 1.2, 
      ease: "power3.out" 
    })
    .to(logoRef.current, { 
      opacity: 1, 
      y: 0, 
      duration: 1.5, 
      ease: "power4.out" 
    }, "-=0.8")
    .to(subtextRef.current, { 
      opacity: 1, 
      y: 0, 
      duration: 1, 
      ease: "power3.out" 
    }, "-=0.8")
    .to(progressRef.current, { 
      opacity: 1, 
      duration: 0.8 
    }, "-=0.5");

    // Progress Bar Animation (Total 3.5 seconds approx)
    tl.to({}, {
      duration: 3.5,
      onUpdate: function() {
        const p = Math.round(this.progress() * 100);
        setPercent(p);
        gsap.set(progressRef.current, { scaleX: this.progress() });
      }
    });

    // Continuous Breathing/Pulse for Logo & Icon
    gsap.to([iconRef.current, logoRef.current], {
      scale: 1.05,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Background Glow Orbs Animation (more dynamic)
    const orbs = containerRef.current.querySelectorAll('.splash-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: "random(-150, 150)",
        y: "random(-150, 150)",
        scale: "random(0.8, 1.5)",
        duration: "random(8, 15)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.5
      });
    });

    // Glitch Effect (randomly every 4-7 seconds)
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        gsap.to(logoRef.current, {
          skewX: "random(-10, 10)",
          x: "random(-5, 5)",
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          onComplete: () => {
            gsap.set(logoRef.current, { skewX: 0, x: 0 });
          }
        });
      }
    }, 5000);

    return () => {
      tl.kill();
      clearInterval(glitchInterval);
      gsap.killTweensOf([iconRef.current, logoRef.current]);
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080808] overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="splash-orb absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent-glow rounded-full filter blur-[120px] opacity-20" />
      <div className="splash-orb absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full filter blur-[100px] opacity-20" />
      <div className="splash-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-glow rounded-full filter blur-[150px] opacity-10" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* App Logo Icon */}
        <div ref={iconRef} className="mb-6 drop-shadow-[0_0_15px_var(--theme-accent)]">
          <FrameOutLogo size={64} className="text-white" />
        </div>

        {/* Logo Text with Shimmer/Scanner */}
        <div className="relative group px-4">
          <h1 
            ref={logoRef}
            className="text-6xl md:text-8xl font-black tracking-[-0.05em] text-white mb-2 drop-shadow-[0_0_30px_rgba(0,245,255,0.3)] select-none"
            style={{ fontStyle: 'italic' }}
          >
            FRAME<span className="text-accent">OUT</span>
          </h1>
          
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-full h-[1px] bg-accent/30 shadow-[0_0_10px_var(--theme-accent)] animate-[scan_3s_linear_infinite]" />
          </div>
        </div>

        {/* Subtext */}
        <p 
          ref={subtextRef}
          className="text-[#849495] tracking-[0.3em] font-medium text-xs md:text-sm uppercase mb-16 animate-pulse"
        >
          Made by <span className="animate-brand ml-1">ADAPTrix</span>
        </p>

        {/* Progress Container */}
        <div className="w-64 md:w-80 h-[2px] bg-white/5 rounded-full relative overflow-hidden">
          <div 
            ref={progressRef}
            className="absolute top-0 left-0 h-full w-full bg-accent origin-left shadow-[0_0_15px_rgba(0,245,255,0.8)]"
          />
        </div>

        {/* Percentage */}
        <div 
          ref={percentRef}
          className="mt-4 font-mono text-[10px] tracking-widest text-[#849495] uppercase"
        >
          Initializing System... {percent}%
        </div>
      </div>

      {/* Aesthetic Border Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("https://grains.com/grain.png")' }}
      />
    </div>
  );
}

